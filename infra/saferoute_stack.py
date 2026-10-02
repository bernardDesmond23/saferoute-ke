"""
SafeRoute Kenya — CDK Stack

Deploys:
  1. Lambda function  → backend/routing_engine.py  (Python 3.11)
  2. API Gateway HTTP API  →  POST /route  (triggers Lambda)
                             OPTIONS /route  (CORS preflight)
  3. DynamoDB table  →  SafeRouteReports  (partition key: report_id)
  4. IAM permissions for Lambda to read/write DynamoDB
"""

import os
from pathlib import Path

import aws_cdk as cdk
from aws_cdk import (
    Duration,
    Stack,
    aws_apigatewayv2 as apigwv2,
    aws_apigatewayv2_integrations as integrations,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    aws_lambda as lambda_,
)
from constructs import Construct

# Resolve the backend/ directory relative to the repo root (one level up from infra/)
BACKEND_DIR = str(Path(__file__).parent.parent / "backend")


class SafeRouteStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ── 1. DynamoDB — SafeRouteReports ─────────────────────────────────
        reports_table = dynamodb.Table(
            self,
            "SafeRouteReports",
            table_name="SafeRouteReports",
            partition_key=dynamodb.Attribute(
                name="report_id",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,  # No provisioned cost
            removal_policy=cdk.RemovalPolicy.RETAIN,  # Keep data on stack deletion
            point_in_time_recovery=True,
        )

        # ── 2. Lambda — Routing Engine ──────────────────────────────────────
        routing_fn = lambda_.Function(
            self,
            "RoutingEngine",
            function_name="saferoute-ke-routing-engine",
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="routing_engine.lambda_handler",
            code=lambda_.Code.from_asset(
                BACKEND_DIR,
                # Bundle Python dependencies listed in requirements.txt
                bundling=cdk.BundlingOptions(
                    image=lambda_.Runtime.PYTHON_3_11.bundling_image,
                    command=[
                        "bash",
                        "-c",
                        "pip install -r requirements.txt -t /asset-output && cp -r . /asset-output",
                    ],
                ),
            ),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={
                "DYNAMODB_TABLE": reports_table.table_name,
                "AWS_REGION_NAME": "us-east-1",
                "LOG_LEVEL": "INFO",
            },
            description="SafeRoute KE — NetworkX Dijkstra flood-aware routing engine",
        )

        # ── 3. IAM — Lambda ↔ DynamoDB permissions ──────────────────────────
        reports_table.grant_read_write_data(routing_fn)

        # Explicit policy for extra clarity (belt-and-suspenders)
        routing_fn.add_to_role_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Query",
                    "dynamodb:Scan",
                ],
                resources=[
                    reports_table.table_arn,
                    f"{reports_table.table_arn}/index/*",
                ],
            )
        )

        # ── 4. API Gateway HTTP API ─────────────────────────────────────────
        http_api = apigwv2.HttpApi(
            self,
            "SafeRouteApi",
            api_name="saferoute-ke-api",
            description="SafeRoute Kenya — Humanitarian Flood Routing API",
            cors_preflight=apigwv2.CorsPreflightOptions(
                allow_origins=["*"],
                allow_methods=[
                    apigwv2.CorsHttpMethod.POST,
                    apigwv2.CorsHttpMethod.OPTIONS,
                ],
                allow_headers=["Content-Type", "Authorization"],
                max_age=Duration.hours(1),
            ),
        )

        lambda_integration = integrations.HttpLambdaIntegration(
            "RoutingIntegration",
            routing_fn,
        )

        # POST /route
        http_api.add_routes(
            path="/route",
            methods=[apigwv2.HttpMethod.POST],
            integration=lambda_integration,
        )

        # ── 5. CloudFormation Outputs ───────────────────────────────────────
        cdk.CfnOutput(
            self,
            "ApiEndpoint",
            value=http_api.api_endpoint,
            description="API Gateway base URL — set as REACT_APP_API_BASE_URL in Amplify",
            export_name="SafeRouteApiEndpoint",
        )

        cdk.CfnOutput(
            self,
            "RoutePostUrl",
            value=f"{http_api.api_endpoint}/route",
            description="Full URL for POST /route",
            export_name="SafeRouteRoutePostUrl",
        )

        cdk.CfnOutput(
            self,
            "DynamoTableName",
            value=reports_table.table_name,
            description="DynamoDB table for volunteer hazard reports",
            export_name="SafeRouteDynamoTable",
        )

        cdk.CfnOutput(
            self,
            "LambdaFunctionArn",
            value=routing_fn.function_arn,
            description="Routing Engine Lambda ARN",
            export_name="SafeRouteLambdaArn",
        )
