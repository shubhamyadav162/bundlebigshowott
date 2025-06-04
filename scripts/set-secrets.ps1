# PowerShell script to set GitHub secrets from credentials.txt
Write-Host "Setting GitHub secrets for OneBigShowOTT..."

# Read credentials file
$credentials = Get-Content -Path "credentials.txt"

# Process each line in the credentials file
foreach ($line in $credentials) {
    if ($line -match "=") {
        $key, $value = $line -split "=", 2
        
        Write-Host "Setting secret: $key"
        
        # Set the GitHub secret
        $value | gh secret set $key
        
        if ($?) {
            Write-Host "Successfully set $key" -ForegroundColor Green
        } else {
            Write-Host "Failed to set $key" -ForegroundColor Red
        }
    }
}

# List all secrets to verify
Write-Host "`nVerifying secrets..."
gh secret list

Write-Host "`nAll secrets have been set. You can now re-run your GitHub workflow." 