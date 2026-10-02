# SafeRoute Kenya — CDK Infrastructure

## Prerequisites

```bash
# 1. Install Python CDK dependencies (create a venv first)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# 2. Bootstrap your AWS account (one-time per account/region)
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1

# 3. Synthesise CloudFormation template (dry-run)
cdk synth

# 4. Deploy
cdk deploy
```

## Stack outputs after deploy

| Output | Description |
|---|---|
| `ApiEndpoint` | API Gateway base URL — set as `REACT_APP_API_BASE_URL` in AWS Amplify env vars |
| `RoutePostUrl` | Full `POST /route` URL for quick testing |
| `DynamoTableName` | `SafeRouteReports` DynamoDB table |
| `LambdaFunctionArn` | Routing Engine Lambda ARN |

## Connecting the frontend

After `cdk deploy` outputs the `ApiEndpoint`, go to:
**AWS Amplify → App settings → Environment variables**
and set:

```
REACT_APP_API_BASE_URL = <ApiEndpoint value>
```

Then redeploy the Amplify app (or trigger a rebuild).

## Testing the API locally

```bash
# Using curl (replace URL after deploy)
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/route \
  -H "Content-Type: application/json" \
  -d '{"origin": "Nairobi", "destination": "Garissa"}'
```

Expected response:

```json
{
  "route": ["Nairobi", "Thika", "Embu", "Isiolo", "Garissa"],
  "total_distance_km": 645.0,
  "risk_score": 1.42,
  "geojson": {
    "type": "Feature",
    "geometry": { "type": "LineString", "coordinates": [[36.82, -1.29], ...] },
    "properties": { ... }
  }
}
```
