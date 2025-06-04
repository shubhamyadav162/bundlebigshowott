#!/bin/bash

# Fix GitHub Workflow Script for Supabase CLI
# This script updates GitHub Actions workflow files to fix the MCP CLI installation issue

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}=== OneBigShowOTT GitHub Workflow Fix ===${NC}"
echo "This script will fix the GitHub Actions workflow error related to Supabase MCP CLI"

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

# Create script directory if it doesn't exist
mkdir -p scripts

# Make the update-remote-workflows.js script executable
chmod +x scripts/update-remote-workflows.js

# Get repository details
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename -s .git "$REPO_URL")
OWNER=$(dirname "$REPO_URL" | xargs basename)

echo -e "${YELLOW}Generating a GitHub token for this operation...${NC}"
TOKEN=$(gh auth token)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get GitHub token.${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully generated GitHub token.${NC}"

# Run the Node.js script to update workflow files
echo -e "${YELLOW}Running update script to fix workflow files...${NC}"
node scripts/update-remote-workflows.js "$TOKEN"

# Update local workflow files if they exist
echo -e "${YELLOW}Updating local workflow files...${NC}"

find .github/workflows -name "*.yml" | while read -r file; do
    echo "Checking $file..."
    if grep -q "@supabase/mcp-cli" "$file"; then
        echo -e "${YELLOW}Fixing $file...${NC}"
        # Replace the MCP CLI installation with Supabase CLI installation
        sed -i 's/npm install -g @supabase\/mcp-cli/# Install Supabase CLI directly from GitHub releases\ncurl -L https:\/\/github.com\/supabase\/cli\/releases\/latest\/download\/supabase_$(uname -s)_x64.tar.gz | tar xz\nsudo mv supabase \/usr\/local\/bin\n# Verify installation\nsupabase --version/g' "$file"
        echo -e "${GREEN}Fixed $file${NC}"
    fi
done

# Final instructions
echo -e "\n${GREEN}Workflow fixes applied.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Commit and push the changes:"
echo "   git add .github/workflows"
echo "   git commit -m \"fix: update Supabase CLI installation in GitHub workflows\""
echo "   git push"
echo ""
echo "2. Re-run any failing GitHub Actions workflows from the GitHub UI"
echo -e "${BLUE}=== Fix completed ===${NC}" 