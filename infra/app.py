#!/usr/bin/env python3
"""
SafeRoute Kenya — AWS CDK Application Entry-Point
Run `cdk deploy` from the infra/ directory.
"""
import aws_cdk as cdk
from saferoute_stack import SafeRouteStack

app = cdk.App()

SafeRouteStack(
    app,
    "SafeRouteStack",
    env=cdk.Environment(region="us-east-1"),
    description="SafeRoute Kenya — Humanitarian flood-aware routing infrastructure",
)

app.synth()
