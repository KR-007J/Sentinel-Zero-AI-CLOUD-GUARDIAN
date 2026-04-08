#!/bin/bash
# =============================================================================
# Sentinel-Zero — GCP Bootstrap Script
# Run once to enable APIs, create Pub/Sub topic, Firestore, and IAM bindings.
# Usage: bash setup_gcp.sh <PROJECT_ID> <REGION>
# =============================================================================

set -euo pipefail

PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
TOPIC="sentinel-threats"
SERVICE_ACCOUNT="sentinel-backend@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🛡️  Setting up Sentinel-Zero on project: $PROJECT_ID"

gcloud config set project "$PROJECT_ID"

# ── Enable APIs ──────────────────────────────────────────────────────────────
echo "→ Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  pubsub.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  logging.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com

# ── Firestore ────────────────────────────────────────────────────────────────
echo "→ Creating Firestore database..."
gcloud firestore databases create \
  --location="$REGION" \
  --type=firestore-native 2>/dev/null || echo "  (Firestore already exists)"

# ── Pub/Sub ──────────────────────────────────────────────────────────────────
echo "→ Creating Pub/Sub topic: $TOPIC"
gcloud pubsub topics create "$TOPIC" 2>/dev/null || echo "  (Topic already exists)"

# ── Service Account ──────────────────────────────────────────────────────────
echo "→ Creating service account for backend..."
gcloud iam service-accounts create sentinel-backend \
  --display-name="Sentinel-Zero Backend" 2>/dev/null || echo "  (SA already exists)"

# IAM roles
for role in \
  roles/aiplatform.user \
  roles/datastore.user \
  roles/pubsub.subscriber \
  roles/logging.logWriter \
  roles/compute.securityAdmin \
  roles/iam.securityAdmin; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="$role" --quiet
done

# ── Artifact Registry ────────────────────────────────────────────────────────
echo "→ Creating Artifact Registry repository..."
gcloud artifacts repositories create sentinel-zero \
  --repository-format=docker \
  --location="$REGION" \
  --description="Sentinel-Zero container images" 2>/dev/null || echo "  (Repo already exists)"

# ── Cloud Logging sink → Pub/Sub ─────────────────────────────────────────────
echo "→ Creating Cloud Logging sink to Pub/Sub..."
gcloud logging sinks create sentinel-log-sink \
  "pubsub.googleapis.com/projects/${PROJECT_ID}/topics/${TOPIC}" \
  --log-filter='severity>=WARNING OR protoPayload.methodName=~"SetIamPolicy|CreateServiceAccount"' \
  2>/dev/null || echo "  (Sink already exists)"

echo ""
echo "✅ Sentinel-Zero GCP setup complete!"
echo ""
echo "Next steps:"
echo "  1. Deploy backend : cd backend && gcloud run deploy sentinel-backend --source . --region $REGION"
echo "  2. Configure push subscription with your Cloud Run URL"
echo "  3. Deploy frontend: cd frontend && firebase deploy --only hosting"
