#!/usr/bin/env bash
set -e

# Script to build and deploy embun_compro to DigitalOcean Droplet
SERVER_IP="143.198.198.218"
SERVER_USER="embun"
REMOTE_PATH="/var/www/embun_compro"

echo "🚀 [1/2] Building Next.js Static Export..."
npm run build

echo "📤 [2/2] Syncing files to DigitalOcean server..."
rsync -avz --delete out/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/

echo "✅ Deploy compro to ${SERVER_IP} completed successfully!"
