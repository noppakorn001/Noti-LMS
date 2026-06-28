#!/bin/bash
# Build and Deploy Noti-LMS to Cloudflare

echo "==================================================="
echo "Preparing Noti-LMS Cloudflare Build..."
echo "==================================================="

npm run build:cf
if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Build failed! Please check compile errors above."
    exit 1
fi

echo ""
echo "==================================================="
echo "Deploying to Cloudflare Workers..."
echo "==================================================="

npx wrangler deploy
if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Cloudflare deployment failed!"
    echo "Please make sure you are logged into Wrangler (run: npx wrangler login)"
    exit 1
fi

echo ""
echo "Uploading VAPID secrets to Cloudflare..."
if [ -f .env.local ]; then
    VAPID_KEY=$(grep -E "^VAPID_PRIVATE_KEY=" .env.local | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'")
    if [ ! -z "$VAPID_KEY" ]; then
        echo "Found VAPID_PRIVATE_KEY in .env.local. Binding secret..."
        echo "$VAPID_KEY" | npx wrangler secret put VAPID_PRIVATE_KEY
    else
        echo "Warning: VAPID_PRIVATE_KEY not found in .env.local. Please check your config."
    fi
else
    echo "Warning: .env.local file not found. Could not configure VAPID secrets."
fi

echo ""
echo "==================================================="
echo "Deployment Successful!"
echo "==================================================="
