# SafeRoute Kenya — Flood-Aware Humanitarian Routing

**SafeRoute Kenya** is a web-based routing engine that finds the **safest** route for Red Cross relief convoys during Kenya's flood season, instead of the shortest. It combines historical flood data, live weather forecasts, and volunteer hazard reports, then uses a modified Dijkstra algorithm to avoid submerged bridges and washed-out roads. The result is aid that actually arrives.

---
### Evidence 
[Evidence of Use Of Coding Agents](docs/screenshots/)

## 🚀 Live Demo

**Try the live application here:**
[https://main.d2swh04kvoyi8u.amplifyapp.com](https://main.d2swh04kvoyi8u.amplifyapp.com)

*Note: The app is deployed on AWS and uses live AWS Lambda and API Gateway endpoints.*

---

## 🗺️ How to Use the App

Follow this flow to see the core capability in action.

### 1. Launch the Dashboard
- Open the live URL above. You'll see a **landing page** explaining the project.
- Click **"Launch Dashboard →"** to enter the main application.

### 2. Compute a Flood-Safe Route
- In the **Mission routing** panel on the left, select an **Origin logistics hub** (e.g., *Garissa Emergency Ops Centre*) and a **Destination center** (e.g., *Mombasa Port Relief Grain Depot*).
- Choose a **Fleet profile** (Heavy aid, 4x4 truck, or Light van).
- Click the green **"Compute flood-safe route"** button.
- **What happens:** The app calls a live AWS Lambda function that runs a modified Dijkstra algorithm on a graph of Kenyan towns. The map will display two routes:
    - 🔴 **Red dashed line:** The standard shortest route, which may cross flood-prone areas.
    - 🟢 **Green solid line:** The **flood-safe route**, which avoids all known hazards.
- Below the map, a comparison panel shows the distance, duration, and risk score for each option. An **Amazon Bedrock briefing** explains why the safe route was chosen.

### 3. Report a Blocked Road (Simulate a Volunteer Report)
- Click the red **"Report Hazard"** button in the top-right corner.
- In the modal, select a **Location / Segment** (e.g., *Tana River Bridge (A3)*).
- Set the **Status** to **"Submerged / Impassable"**.
- (Optional) Add a note, like *"Bridge is completely submerged. Not passable."*
- Click **"Report Blocked Road"**.
- **What happens:** The report is written to an Amazon DynamoDB table. On your next route computation, the routing engine will treat that segment as impassable (infinite cost). You will see the green route change to a longer detour, demonstrating how live field intelligence is used.

### 4. Explore the Map Layers
- In the **Risk Layers** panel on the map, you can toggle:
    - **Live Weather:** Overlays rainfall data from Open-Meteo.
    - **Hazard Markers:** Shows pins for reported hazards.
    - **Compare Shortest:** Shows the red "Standard Shortest" route alongside the green safe route.
    - **Flood Basins:** Highlights historically flood-prone river basins.

---

## 🛠️ Architecture

The system is deployed as a serverless stack on AWS `us-east-1`.

```mermaid
flowchart TB
    subgraph Users
        Coord[Coordinator]
    end
    subgraph Frontend["AWS Amplify"]
        AMP[React + MapLibre GL]
    end
    subgraph API["API Gateway"]
        APIGW[POST /route]
    end
    subgraph Compute
        Lambda[Lambda: Routing Engine<br/>Python + NetworkX]
    end
    subgraph Data
        DDB[(DynamoDB: SafeRouteReports)]
    end
    subgraph AI
        Bedrock[Amazon Bedrock<br/>Claude 3 Haiku]
    end
    subgraph External
        OSM[OpenStreetMap]
        OpenMeteo[Open-Meteo]
    end

    Coord -->|HTTPS| AMP
    AMP -->|POST /route| APIGW
    APIGW --> Lambda
    Lambda -->|Query reports| DDB
    Lambda -->|InvokeModel| Bedrock
    Lambda -->|Graph source| OSM
    Lambda -->|Rainfall| OpenMeteo
    Lambda -->|GeoJSON| APIGW
    APIGW --> AMP