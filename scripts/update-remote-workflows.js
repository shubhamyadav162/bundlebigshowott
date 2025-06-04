// Script to update remote workflows that might be using MCP CLI
// Run with: node scripts/update-remote-workflows.js YOUR_GITHUB_TOKEN

const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub repository details
const owner = process.env.GITHUB_REPOSITORY_OWNER || 'your-username';
const repo = process.env.GITHUB_REPOSITORY_NAME || 'OneBigShowOTT';
const token = process.argv[2]; // Pass GitHub token as command line argument

if (!token) {
  console.error('Error: GitHub token is required.');
  console.error('Usage: node update-remote-workflows.js YOUR_GITHUB_TOKEN');
  process.exit(1);
}

// Function to make GitHub API requests
function githubRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}${endpoint}`,
      method: method,
      headers: {
        'User-Agent': 'OneBigShowOTT-Workflow-Updater',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          console.error(`GitHub API error (${res.statusCode}):`, responseData);
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to get all workflow files
async function getWorkflows() {
  try {
    const contents = await githubRequest('GET', '/contents/.github/workflows');
    return contents.filter(item => item.type === 'file' && item.name.endsWith('.yml'));
  } catch (error) {
    console.error('Error getting workflows:', error.message);
    return [];
  }
}

// Function to get workflow content
async function getWorkflowContent(file) {
  try {
    const content = await githubRequest('GET', `/contents/${file.path}`);
    const decodedContent = Buffer.from(content.content, 'base64').toString('utf8');
    return {
      file: file,
      content: decodedContent,
      sha: content.sha
    };
  } catch (error) {
    console.error(`Error getting content for ${file.path}:`, error.message);
    return null;
  }
}

// Function to update workflow content
async function updateWorkflow(file, content, sha) {
  try {
    const updatedContent = content
      // Replace the MCP CLI installation step
      .replace(/- name: Install MCP CLI[\s\S]*?npm install -g @supabase\/mcp-cli/g, 
               `- name: Install Supabase CLI
        run: |
          curl -L https://github.com/supabase/cli/releases/latest/download/supabase_\\$(uname -s)_x64.tar.gz | tar xz
          sudo mv supabase /usr/local/bin
          supabase --version`);
    
    if (updatedContent !== content) {
      console.log(`Updating workflow: ${file.path}`);
      
      await githubRequest('PUT', `/contents/${file.path}`, {
        message: 'Update workflow to use Supabase CLI instead of MCP CLI',
        content: Buffer.from(updatedContent).toString('base64'),
        sha: sha
      });
      
      console.log(`Updated workflow: ${file.path}`);
      return true;
    } else {
      console.log(`No changes needed for: ${file.path}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${file.path}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('Fetching workflows...');
    const workflows = await getWorkflows();
    console.log(`Found ${workflows.length} workflows`);
    
    for (const workflow of workflows) {
      const workflowData = await getWorkflowContent(workflow);
      if (workflowData) {
        // Check if the workflow contains MCP CLI
        if (workflowData.content.includes('Install MCP CLI') || 
            workflowData.content.includes('@supabase/mcp-cli')) {
          console.log(`Found MCP CLI in ${workflow.path}`);
          await updateWorkflow(workflow, workflowData.content, workflowData.sha);
        }
      }
    }
    
    console.log('Done processing workflows');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 