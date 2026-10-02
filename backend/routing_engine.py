"""
SafeRoute Kenya — Routing Engine Lambda
---------------------------------------
Runs Dijkstra's algorithm on a hardcoded graph of Kenyan towns, where every
edge weight = distance_km * risk_factor.  Edges with risk_factor >= 999 are
treated as impassable and removed from the graph before the search.

Accepts (via API Gateway HTTP-API JSON body):
  { "origin": "Nairobi", "destination": "Garissa" }

Returns:
  {
    "route":          ["Nairobi", "Thika", "Garissa"],
    "total_distance": 368.4,
    "risk_score":     1.45,
    "geojson": {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[lng, lat], ...] },
      "properties": { "total_distance_km": 368.4, "risk_score": 1.45,
                      "route": ["Nairobi", ...] }
    }
  }
"""

import json
import math
import networkx as nx

# ---------------------------------------------------------------------------
# Node coordinates  (longitude, latitude)
# ---------------------------------------------------------------------------
NODE_COORDS: dict[str, tuple[float, float]] = {
    "Nairobi":   (36.8172, -1.2864),
    "Thika":     (37.0833, -1.0333),
    "Garissa":   (39.6460, -0.4532),
    "Kisumu":    (34.7680, -0.0917),
    "Mombasa":   (39.6682, -4.0435),
    "Nakuru":    (36.0667, -0.2833),
    "Eldoret":   (35.2699,  0.5200),
    "Isiolo":    (37.5822,  0.3546),
    "Garsen":    (40.1000, -2.2667),
    "Malindi":   (40.1169, -3.2138),
    "Dadaab":    (40.3015,  0.0543),
    "Wajir":     (40.0573,  1.7470),
    "Marsabit":  (37.9883,  2.3333),
    "Lodwar":    (35.5973,  3.1191),
    "Kitale":    (35.0062,  1.0167),
    "Nyeri":     (36.9500, -0.4167),
    "Embu":      (37.4500, -0.5333),
    "Muranga":   (37.1500, -0.7167),
}

# ---------------------------------------------------------------------------
# Edge definitions
# (node_a, node_b, distance_km, base_risk_factor)
#
# risk_factor meaning:
#   1.0  – normal, dry road
#   1.5  – seasonally degraded gravel
#   2.0  – partially flooded / poor surface
#   5.0  – high flood risk corridor
#   999  – currently impassable (submerged bridge / washed out)
# ---------------------------------------------------------------------------
EDGES: list[tuple[str, str, float, float]] = [
    # --- Nairobi metropolitan ring ---
    ("Nairobi",  "Thika",    45.0,  1.0),
    ("Nairobi",  "Nakuru",  160.0,  1.0),
    ("Nairobi",  "Muranga",  90.0,  1.2),
    ("Nairobi",  "Nyeri",   155.0,  1.1),
    ("Nairobi",  "Embu",    120.0,  1.2),

    # --- Eastern / North-Eastern corridor (Tana River flood zone) ---
    ("Thika",    "Muranga",  50.0,  1.0),
    ("Thika",    "Embu",     85.0,  1.1),
    ("Embu",     "Isiolo",  110.0,  1.3),
    ("Isiolo",   "Garissa", 255.0,  2.0),   # Seasonal flooding on lower section
    ("Garissa",  "Dadaab",  180.0,  1.8),
    ("Garissa",  "Wajir",   220.0,  1.5),
    ("Dadaab",   "Wajir",   100.0,  1.4),
    ("Wajir",    "Marsabit",280.0,  1.6),

    # --- Tana River low-level crossing (frequently submerged) ---
    ("Garissa",  "Garsen",  280.0, 999.0),  # IMPASSABLE — bridge submerged

    # --- Mombasa / Coast corridor ---
    ("Nairobi",  "Mombasa", 480.0,  1.0),   # A109 Nairobi–Mombasa highway
    ("Garsen",   "Mombasa", 220.0,  2.0),   # Coastal road, flood-prone culverts
    ("Mombasa",  "Malindi",  120.0,  1.2),
    ("Malindi",  "Garsen",  100.0,  2.5),   # Low-level drifts

    # --- Northern Rift corridor ---
    ("Nakuru",   "Eldoret",  155.0,  1.0),
    ("Nakuru",   "Kisumu",   60.0,  1.1),   # Includes Ahero – flood risk
    ("Kisumu",   "Eldoret",  140.0,  1.2),
    ("Eldoret",  "Kitale",   53.0,  1.0),
    ("Kitale",   "Lodwar",  310.0,  1.8),   # Turkwel gorge area
    ("Eldoret",  "Lodwar",  340.0,  2.0),

    # --- Central highlands ---
    ("Nyeri",    "Muranga",  60.0,  1.0),
    ("Nyeri",    "Embu",    100.0,  1.1),
    ("Marsabit", "Isiolo",  220.0,  1.7),

    # --- Additional Kisumu links ---
    ("Kisumu",   "Nairobi", 340.0,  1.1),   # A1 via Nakuru (alternative weight)
    ("Kisumu",   "Kitale",  120.0,  1.2),
]


def haversine_km(coord_a: tuple[float, float], coord_b: tuple[float, float]) -> float:
    """Great-circle distance between two (lng, lat) points in km."""
    lon1, lat1 = math.radians(coord_a[0]), math.radians(coord_a[1])
    lon2, lat2 = math.radians(coord_b[0]), math.radians(coord_b[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(a))


def build_graph() -> nx.Graph:
    G = nx.Graph()

    # Add all nodes with coordinate attributes
    for name, (lng, lat) in NODE_COORDS.items():
        G.add_node(name, lng=lng, lat=lat)

    # Add passable edges only
    for node_a, node_b, dist_km, risk_factor in EDGES:
        if risk_factor >= 999:
            # Impassable — do not add to graph; Dijkstra will route around it
            continue
        weight = dist_km * risk_factor
        G.add_edge(
            node_a, node_b,
            distance_km=dist_km,
            risk_factor=risk_factor,
            weight=weight,
        )

    return G


def route_to_geojson(path: list[str], total_dist: float, risk_score: float) -> dict:
    coordinates = [list(NODE_COORDS[node]) for node in path]  # [[lng, lat], ...]
    return {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": coordinates,
        },
        "properties": {
            "route": path,
            "total_distance_km": round(total_dist, 1),
            "risk_score": round(risk_score, 3),
        },
    }


def _cors_response(status: int, body: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body),
    }


def lambda_handler(event: dict, context) -> dict:
    """
    AWS Lambda entry-point.

    Supports:
      - OPTIONS preflight (CORS)
      - POST with JSON body: { "origin": "...", "destination": "..." }
    """

    # ── CORS preflight ──────────────────────────────────────────────────────
    if event.get("requestContext", {}).get("http", {}).get("method", "") == "OPTIONS":
        return _cors_response(200, {"message": "OK"})

    # ── Parse request body ──────────────────────────────────────────────────
    try:
        raw_body = event.get("body") or "{}"
        if isinstance(raw_body, str):
            body = json.loads(raw_body)
        else:
            body = raw_body
    except (json.JSONDecodeError, TypeError) as exc:
        return _cors_response(400, {"error": f"Invalid JSON body: {exc}"})

    origin = (body.get("origin") or "").strip()
    destination = (body.get("destination") or "").strip()

    if not origin or not destination:
        return _cors_response(400, {"error": "'origin' and 'destination' are required"})

    # ── Validate nodes ──────────────────────────────────────────────────────
    valid_nodes = set(NODE_COORDS.keys())
    if origin not in valid_nodes:
        return _cors_response(
            400,
            {
                "error": f"Unknown origin '{origin}'",
                "valid_nodes": sorted(valid_nodes),
            },
        )
    if destination not in valid_nodes:
        return _cors_response(
            400,
            {
                "error": f"Unknown destination '{destination}'",
                "valid_nodes": sorted(valid_nodes),
            },
        )

    if origin == destination:
        return _cors_response(400, {"error": "Origin and destination must be different"})

    # ── Build graph and run Dijkstra ────────────────────────────────────────
    G = build_graph()

    try:
        path = nx.dijkstra_path(G, origin, destination, weight="weight")
    except nx.NetworkXNoPath:
        return _cors_response(
            422,
            {
                "error": (
                    f"No passable route from '{origin}' to '{destination}'. "
                    "All paths may be blocked by impassable flood segments."
                )
            },
        )
    except nx.NodeNotFound as exc:
        return _cors_response(500, {"error": f"Graph node not found: {exc}"})

    # ── Accumulate totals ───────────────────────────────────────────────────
    total_distance = 0.0
    total_weight = 0.0

    for i in range(len(path) - 1):
        edge_data = G[path[i]][path[i + 1]]
        total_distance += edge_data["distance_km"]
        total_weight += edge_data["weight"]

    # Aggregate risk score = total_weight / total_distance (weighted average risk_factor)
    risk_score = total_weight / total_distance if total_distance > 0 else 1.0

    geojson = route_to_geojson(path, total_distance, risk_score)

    return _cors_response(
        200,
        {
            "route": path,
            "total_distance_km": round(total_distance, 1),
            "risk_score": round(risk_score, 3),
            "geojson": geojson,
        },
    )
