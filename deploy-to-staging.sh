#!/usr/bin/env bash
set -e

SERVER_IP="188.166.243.175"
SERVER_PORT="2222"
SERVER_USER="root"
REMOTE_PATH="/var/www/embun_compro_staging"

echo "🚀 [1/2] Building Next.js Static Export for Staging..."
npm run build

echo "📤 [2/2] Syncing files to Staging server..."
rsync -avz --delete -e "ssh -p ${SERVER_PORT}" out/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/

echo "✅ Deploy compro to Staging (${SERVER_IP}) completed successfully!"
