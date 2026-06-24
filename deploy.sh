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
echo "==================================================="
echo "Deployment Successful!"
echo "==================================================="
