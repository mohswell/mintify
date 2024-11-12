# scripts/setup_env.sh
#!/bin/bash
set -e

# export BASE_APP_URL="${{ secrets.BASE_APP_URL }}"
# export API_KEY="${{ secrets.API_KEY }}"

echo "Setting up environment variables..."
echo "BASE_APP_URL=$BASE_APP_URL" >> $GITHUB_ENV
echo "API_KEY=$API_KEY" >> $GITHUB_ENV

# Create temp directory for analysis artifacts
mkdir -p .analysis-tmp