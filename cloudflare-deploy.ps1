# Script for deploying to Cloudflare Pages (for Windows)
# Author: egoro
# Version: 1.0

# Function for colored output
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$true)]
        [string]$Color
    )
    
    $currentForeground = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $currentForeground
}

# Check if Wrangler is installed
function Test-Wrangler {
    try {
        $version = npx wrangler --version 2>$null
        Write-ColorOutput "✓ Wrangler found: $version" "Green"
        return $true
    } catch {
        Write-ColorOutput "✗ Wrangler not found. Using archive mode instead." "Yellow"
        return $false
    }
}

# Check if user is authenticated with Cloudflare
function Test-CloudflareAuth {
    try {
        $whoami = npx wrangler whoami 2>$null
        if ($whoami -match "You are logged in") {
            Write-ColorOutput "✓ You are authenticated with Cloudflare" "Green"
            return $true
        } else {
            Write-ColorOutput "✗ You are not authenticated with Cloudflare. Starting authentication..." "Yellow"
            npx wrangler login
            if ($?) {
                return $true
            } else {
                Write-ColorOutput "✗ Failed to authenticate with Cloudflare" "Red"
                return $false
            }
        }
    } catch {
        Write-ColorOutput "✗ Error checking Cloudflare authentication" "Red"
        try {
            Write-ColorOutput "Starting authentication..." "Yellow"
            npx wrangler login
            if ($?) {
                return $true
            } else {
                return $false
            }
        } catch {
            Write-ColorOutput "✗ Failed to authenticate with Cloudflare" "Red"
            return $false
        }
    }
}

# Function to create a ZIP archive of the project
function New-ProjectZip {
    param(
        [string]$OutputPath = "mts-design-cards-deploy.zip"
    )
    
    Write-ColorOutput "Creating project ZIP archive..." "Cyan"
    
    # Create a temporary directory for project files
    $tempDir = "temp-deploy"
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force
    }
    New-Item -Path $tempDir -ItemType Directory | Out-Null
    
    # Copy necessary files, excluding unwanted ones
    $excludeDirs = @(".git", "node_modules", ".github")
    $excludeFiles = @(".gitignore", "cloudflare-deploy.sh", "cloudflare-deploy.ps1", "deploy.sh", "deploy.ps1")
    
    # Copy directories
    Get-ChildItem -Directory | ForEach-Object {
        if ($excludeDirs -notcontains $_.Name) {
            Copy-Item -Path $_.FullName -Destination "$tempDir\$($_.Name)" -Recurse
        }
    }
    
    # Copy files
    Get-ChildItem -File | ForEach-Object {
        $skip = $false
        foreach ($exclude in $excludeFiles) {
            if ($_.Name -like $exclude) {
                $skip = $true
                break
            }
        }
        if (-not $skip) {
            Copy-Item -Path $_.FullName -Destination "$tempDir\$($_.Name)"
        }
    }
    
    # Create the ZIP archive
    if (Test-Path $OutputPath) {
        Remove-Item -Path $OutputPath -Force
    }
    
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $OutputPath)
        
        # Delete the temporary directory
        Remove-Item -Path $tempDir -Recurse -Force
        
        if (Test-Path $OutputPath) {
            Write-ColorOutput "✓ ZIP archive successfully created: $OutputPath" "Green"
            return $true
        } else {
            Write-ColorOutput "✗ Failed to create ZIP archive" "Red"
            return $false
        }
    } catch {
        Write-ColorOutput "✗ Error creating ZIP archive: $_" "Red"
        return $false
    }
}

# Function to deploy the project to Cloudflare Pages
function Deploy-ToCloudflare {
    param(
        [string]$ProjectName = "mts-design-cards",
        [string]$Branch = "main"
    )
    
    Write-ColorOutput "Starting deployment to Cloudflare Pages..." "Cyan"
    
    # List projects to check if ours exists
    $projects = npx wrangler pages project list 2>$null
    if (-not ($projects -match $ProjectName)) {
        Write-ColorOutput "Project '$ProjectName' not found. Creating a new project..." "Yellow"
        npx wrangler pages project create $ProjectName --production-branch=$Branch
    }
    
    # Deploy the project
    Write-ColorOutput "Deploying project '$ProjectName' to Cloudflare Pages..." "Cyan"
    npx wrangler pages deploy . --project-name=$ProjectName --branch=$Branch
    
    if ($?) {
        Write-ColorOutput "✓ Deployment successfully completed!" "Green"
        return $true
    } else {
        Write-ColorOutput "✗ Deployment error" "Red"
        return $false
    }
}

# Main function
function Main {
    Write-ColorOutput "=============================================" "Cyan"
    Write-ColorOutput "    Deploy MTS Design Cards to Cloudflare    " "Cyan"
    Write-ColorOutput "=============================================" "Cyan"
    
    if (Test-Wrangler) {
        if (Test-CloudflareAuth) {
            # Ask for project name
            $projectName = Read-Host "Enter project name on Cloudflare Pages (default: mts-design-cards)"
            if ([string]::IsNullOrEmpty($projectName)) {
                $projectName = "mts-design-cards"
            }
            
            # Deploy directly through Wrangler
            if (Deploy-ToCloudflare -ProjectName $projectName) {
                Write-ColorOutput "Project successfully deployed to Cloudflare Pages!" "Green"
                Write-ColorOutput "URL: https://$projectName.pages.dev" "Cyan"
            } else {
                Write-ColorOutput "An error occurred during deployment." "Red"
                Write-ColorOutput "Try the archive method. Creating a ZIP archive..." "Yellow"
                
                if (New-ProjectZip) {
                    Write-ColorOutput "Upload the mts-design-cards-deploy.zip file through the Cloudflare Pages panel:" "Cyan"
                    Write-ColorOutput "1. Go to https://dash.cloudflare.com/" "Cyan"
                    Write-ColorOutput "2. Select 'Pages' in the side menu" "Cyan"
                    Write-ColorOutput "3. Select 'Create application'" "Cyan"
                    Write-ColorOutput "4. Select 'Upload assets'" "Cyan"
                    Write-ColorOutput "5. Drag and drop the created ZIP file" "Cyan"
                }
            }
        } else {
            Write-ColorOutput "Failed to authenticate with Cloudflare. Creating a ZIP archive for manual upload..." "Yellow"
            if (New-ProjectZip) {
                Write-ColorOutput "Upload the mts-design-cards-deploy.zip file through the Cloudflare Pages panel manually." "Cyan"
            }
        }
    } else {
        # If Wrangler is not found, create a ZIP archive
        Write-ColorOutput "Creating a ZIP archive for manual upload..." "Yellow"
        if (New-ProjectZip) {
            Write-ColorOutput "Upload the mts-design-cards-deploy.zip file through the Cloudflare Pages panel:" "Cyan"
            Write-ColorOutput "1. Go to https://dash.cloudflare.com/" "Cyan"
            Write-ColorOutput "2. Select 'Pages' in the side menu" "Cyan"
            Write-ColorOutput "3. Select 'Create application'" "Cyan"
            Write-ColorOutput "4. Select 'Upload assets'" "Cyan"
            Write-ColorOutput "5. Drag and drop the created ZIP file" "Cyan"
        }
    }
    
    Write-ColorOutput "=============================================" "Cyan"
    Write-ColorOutput "            Operation completed               " "Cyan"
    Write-ColorOutput "=============================================" "Cyan"
}

# Run the main function
Main 