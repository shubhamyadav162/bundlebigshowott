# Fix GitHub Actions MCP CLI Error Guide

This guide provides a step-by-step process to fix the GitHub Actions workflow error related to the non-existent `@supabase/mcp-cli` package. Follow these instructions to get your workflows running properly again.

## The Problem

Your GitHub Actions workflows are failing with an error like this:

```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@supabase%2fmcp-cli - Not found
npm ERR! 404 '@supabase/mcp-cli@*' is not in this registry.
```

This occurs because Supabase has renamed or reorganized its CLI package, and `@supabase/mcp-cli` no longer exists.

## Solution Options

### Option 1: Run the Automated Fix Script (Recommended)

We've created scripts to automatically fix this issue:

1. Make the script executable:
   ```bash
   chmod +x scripts/fix-workflow.sh
   ```

2. Run the script:
   ```bash
   ./scripts/fix-workflow.sh
   ```

3. Follow the on-screen instructions to commit and push your changes.

### Option 2: Manual Fix

If you prefer to make the changes manually:

1. Find all workflow files (`.yml` files in `.github/workflows/` directory) that include references to `@supabase/mcp-cli`.

2. Replace any step that installs the MCP CLI:
   ```yaml
   - name: Install MCP CLI
     run: npm install -g @supabase/mcp-cli
   ```

   With the correct Supabase CLI installation:
   ```yaml
   - name: Install Supabase CLI
     run: |
       # Install Supabase CLI directly from GitHub releases
       curl -L https://github.com/supabase/cli/releases/latest/download/supabase_$(uname -s)_x64.tar.gz | tar xz
       sudo mv supabase /usr/local/bin
       # Verify installation
       supabase --version
   ```

3. Save your changes, commit, and push to GitHub.

### Option 3: Fix Only Remote Workflow Files

If you need to fix workflow files that exist only on GitHub but not in your local repository:

1. Run the Node.js script:
   ```bash
   node scripts/update-remote-workflows.js YOUR_GITHUB_TOKEN
   ```
   Replace `YOUR_GITHUB_TOKEN` with a valid GitHub personal access token.

## GitHub Secrets Setup

To ensure your workflows run properly, make sure the following GitHub secrets are set:

1. `SUPABASE_ACCESS_TOKEN`: Your Supabase access token (service role key)
2. `SUPABASE_PROJECT_REF`: Your Supabase project reference ID
3. `SUPABASE_PROD_URL`: Your Supabase project URL
4. `SUPABASE_PROD_SERVICE_ROLE_KEY`: Your Supabase service role key
5. `SUPABASE_PROD_ANON_KEY`: Your Supabase anonymous key
6. `PAYMENT_GATEWAY_PROD_SECRET`: Your payment gateway secret
7. `SLACK_WEBHOOK`: Your Slack webhook URL (if using Slack notifications)

## Verifying the Fix

1. After pushing your changes, go to your GitHub repository Actions tab.
2. Find the workflow that was previously failing.
3. Click "Re-run all jobs" to trigger the workflow again.
4. Verify that the workflow now runs successfully without the MCP CLI error.

## Getting Help

If you're still experiencing issues after following these steps:

1. Check the GitHub Actions logs for detailed error messages.
2. Verify that all required secrets are properly set in your GitHub repository.
3. Check the Supabase CLI documentation for any updates or changes to installation procedures.

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 