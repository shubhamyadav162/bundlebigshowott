# GitHub Workflow Fix: Replacing MCP CLI with Supabase CLI

This guide provides instructions on how to fix the GitHub Actions workflow error related to the non-existent `@supabase/mcp-cli` package.

## Problem Description

GitHub Actions is failing with the following error:

```
##[debug]Starting: Install MCP CLI
Run npm install -g @supabase/mcp-cli
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@supabase%2fmcp-cli - Not found
```

This occurs because a workflow step is trying to install a non-existent package `@supabase/mcp-cli`.

## Solution

We have two ways to fix this issue:

### Option 1: Update Local Workflow Files (Already Done)

We have updated the following local workflow files to use the Supabase CLI directly from GitHub releases instead of the non-existent MCP CLI:

1. `.github/workflows/deploy-edge-functions.yml`
2. `.github/workflows/verify-subscription.yml`
3. `.github/workflows/deploy-backend.yml`

These changes should be committed and pushed to your GitHub repository.

### Option 2: Update Remote Workflow Files

If the error persists after pushing the local changes, there might be hidden or remote-only workflow files that still reference the MCP CLI. You can update these using the provided script:

1. Generate a GitHub Personal Access Token with `workflow` and `repo` permissions
2. Run the script:

```bash
node scripts/update-remote-workflows.js YOUR_GITHUB_TOKEN
```

This script will:
- Fetch all workflow files from your GitHub repository
- Check each one for references to the MCP CLI
- Update any found references to use the Supabase CLI instead
- Commit the changes directly to your repository

### Option 3: Disable Problematic Workflows in GitHub Settings

If the above options don't work, you can manually disable the problematic workflows:

1. Go to your GitHub repository
2. Navigate to "Settings" > "Actions" > "General"
3. Under "Workflows", find any workflows that might be using the MCP CLI
4. Disable them by clicking on the workflow and toggling it off

## Verifying the Fix

After implementing any of the above solutions:

1. Trigger a new workflow run manually
2. Check the logs to ensure that the MCP CLI installation step is no longer failing
3. Verify that your edge functions are being deployed correctly

## Additional Notes

- The error message shows exactly which step is failing (`Install MCP CLI`), which helps identify the problematic workflow.
- The updated workflows use the official Supabase CLI installed directly from GitHub releases, which is more reliable and maintained.
- If you need further assistance, please check the Supabase documentation for the latest CLI installation and usage instructions. 