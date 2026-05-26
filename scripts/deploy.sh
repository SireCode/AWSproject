#!/usr/bin/env bash
set -e

ENV=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME=${3:-cbdfs-stack}

echo "=== CBDFS Deploy ==="
echo "Environment : $ENV"
echo "Region      : $REGION"
echo "Stack       : $STACK_NAME"
echo ""

# Install backend deps
echo "[1/4] Installing backend dependencies..."
cd backend && npm install && cd ..

# SAM build
echo "[2/4] Building SAM project..."
sam build --template infrastructure/template.yaml

# SAM deploy
echo "[3/4] Deploying to AWS..."
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides Environment="$ENV"

# Capture outputs
echo "[4/4] Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs" \
  --output table

echo ""
echo "Update frontend/src/aws-config.js with the ApiUrl, UserPoolId, and UserPoolClientId before building the frontend."
