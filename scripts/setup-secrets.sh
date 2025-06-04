#!/bin/bash

# Setup GitHub Secrets for OneBigShowOTT
# This script helps set up the required GitHub secrets for Supabase and other services

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}=== OneBigShowOTT GitHub Secrets Setup ===${NC}"
echo "This script will help you set up the required GitHub secrets for your project"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
echo -e "${YELLOW}Checking GitHub authentication...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${RED}You are not logged in to GitHub CLI.${NC}"
    echo "Please login first using: gh auth login"
    exit 1
fi

echo -e "${GREEN}GitHub authentication successful.${NC}"

# Function to prompt for secret value
get_secret_value() {
    local secret_name=$1
    local description=$2
    local default_value=$3
    
    echo -e "${YELLOW}$description${NC}"
    if [ -n "$default_value" ]; then
        read -p "Enter value for $secret_name (press Enter to use default): " value
        value=${value:-$default_value}
    else
        read -p "Enter value for $secret_name: " value
    fi
    
    echo "$value"
}

# Prompt for Supabase project details
echo -e "\n${BLUE}Supabase Project Details${NC}"
echo "Let's set up your Supabase project details."

# Get Supabase URL
SUPABASE_URL=$(get_secret_value "SUPABASE_PROD_URL" "Your Supabase project URL (e.g., https://hjsdcsatfcysrwsryngu.supabase.co)" "https://hjsdcsatfcysrwsryngu.supabase.co")

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_URL | cut -d '/' -f3 | cut -d '.' -f1)

# Get service role key
SERVICE_ROLE_KEY=$(get_secret_value "SUPABASE_PROD_SERVICE_ROLE_KEY" "Your Supabase service role key (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...)" "")

# Get anon key
ANON_KEY=$(get_secret_value "SUPABASE_PROD_ANON_KEY" "Your Supabase anon key (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...)" "")

# Get Supabase access token
ACCESS_TOKEN=$(get_secret_value "SUPABASE_ACCESS_TOKEN" "Your Supabase access token (starts with sbp_)" "")

# Get DB password
DB_PASSWORD=$(get_secret_value "SUPABASE_DB_PASSWORD" "Your Supabase database password" "")

# Get payment gateway secret
PAYMENT_SECRET=$(get_secret_value "PAYMENT_GATEWAY_PROD_SECRET" "Your payment gateway secret" "")

# Get Lightspeed API details
LIGHTSPEED_API_KEY=$(get_secret_value "LIGHTSPEED_PROD_API_KEY" "Your Lightspeed API key" "")
LIGHTSPEED_API_SECRET=$(get_secret_value "LIGHTSPEED_PROD_API_SECRET" "Your Lightspeed API secret" "")

# Get Slack webhook URL
SLACK_WEBHOOK=$(get_secret_value "SLACK_WEBHOOK" "Your Slack webhook URL (optional)" "")

# Confirm before setting secrets
echo -e "\n${YELLOW}Ready to set the following GitHub secrets:${NC}"
echo "- SUPABASE_PROD_URL"
echo "- SUPABASE_PROD_SERVICE_ROLE_KEY"
echo "- SUPABASE_PROD_ANON_KEY"
echo "- SUPABASE_ACCESS_TOKEN"
echo "- SUPABASE_DB_PASSWORD"
echo "- PAYMENT_GATEWAY_PROD_SECRET"
echo "- LIGHTSPEED_PROD_API_KEY"
echo "- LIGHTSPEED_PROD_API_SECRET"
if [ -n "$SLACK_WEBHOOK" ]; then
    echo "- SLACK_WEBHOOK"
fi

read -p "Continue? (y/n): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Set GitHub secrets
echo -e "\n${YELLOW}Setting GitHub secrets...${NC}"

set_secret() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}Skipping $name (empty value)${NC}"
        return
    fi
    
    echo -e "Setting $name..."
    if gh secret set "$name" --body "$value"; then
        echo -e "${GREEN}Successfully set $name${NC}"
    else
        echo -e "${RED}Failed to set $name${NC}"
    fi
}

set_secret "SUPABASE_PROD_URL" "$SUPABASE_URL"
set_secret "SUPABASE_PROD_SERVICE_ROLE_KEY" "$SERVICE_ROLE_KEY"
set_secret "SUPABASE_PROD_ANON_KEY" "$ANON_KEY"
set_secret "SUPABASE_ACCESS_TOKEN" "$ACCESS_TOKEN"
set_secret "SUPABASE_DB_PASSWORD" "$DB_PASSWORD"
set_secret "PAYMENT_GATEWAY_PROD_SECRET" "$PAYMENT_SECRET"
set_secret "LIGHTSPEED_PROD_API_KEY" "$LIGHTSPEED_API_KEY"
set_secret "LIGHTSPEED_PROD_API_SECRET" "$LIGHTSPEED_API_SECRET"
set_secret "SLACK_WEBHOOK" "$SLACK_WEBHOOK"

# Also set project reference ID for convenience
set_secret "SUPABASE_PROJECT_REF" "$PROJECT_REF"

echo -e "\n${GREEN}All secrets have been set.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run the fix-workflow.sh script to update your GitHub workflows:"
echo "   ./scripts/fix-workflow.sh"
echo ""
echo "2. Re-run any failing GitHub Actions workflows from the GitHub UI"
echo -e "${BLUE}=== Setup completed ===${NC}" 