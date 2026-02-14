# Azure Deployment Guide

This guide covers deploying the Origin Hair Collective coming-soon sites to Azure Static Web Apps and connecting custom domains purchased on Namecheap.

## Architecture Overview

| Component | Azure Service | Domain |
|-----------|--------------|--------|
| Origin Hair Coming Soon | Azure Static Web Apps | originhair.com |
| Mane Haus Coming Soon | Azure Static Web Apps | manehaus.com |
| Admin UI | Azure Static Web Apps | admin.originhair.com |
| API Gateway + Microservices | Azure Container Apps (future) | api.originhair.com |

---

## Part 1: Manual Azure Setup

### Prerequisites

- Azure account with active subscription
- Azure CLI installed (`az --version`)
- GitHub repository connected to Azure

### Step 1: Install Azure CLI

```bash
# Windows (winget)
winget install -e --id Microsoft.AzureCLI

# Or download from https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
```

### Step 2: Login and Set Subscription

```bash
az login
az account set --subscription "<your-subscription-id>"
```

### Step 3: Create Resource Group

```bash
az group create \
  --name rg-originhair-prod \
  --location eastus2
```

### Step 4: Create Azure Static Web App for Origin Hair Coming Soon

```bash
az staticwebapp create \
  --name swa-origin-coming-soon \
  --resource-group rg-originhair-prod \
  --location eastus2 \
  --source https://github.com/<your-org>/OriginHairCollective \
  --branch main \
  --app-location "src/OriginHairCollective.Web" \
  --output-location "dist/origin-hair-collective-coming-soon/browser" \
  --login-with-github
```

### Step 5: Create Azure Static Web App for Mane Haus Coming Soon

```bash
az staticwebapp create \
  --name swa-mane-haus-coming-soon \
  --resource-group rg-originhair-prod \
  --location eastus2 \
  --source https://github.com/<your-org>/OriginHairCollective \
  --branch main \
  --app-location "src/OriginHairCollective.Web" \
  --output-location "dist/main-haus-coming-soon/browser" \
  --login-with-github
```

### Step 6: Get Deployment Tokens

After creating each Static Web App, retrieve the deployment token for GitHub Actions:

```bash
# Origin Hair
az staticwebapp secrets list \
  --name swa-origin-coming-soon \
  --resource-group rg-originhair-prod \
  --query "properties.apiKey" -o tsv

# Mane Haus
az staticwebapp secrets list \
  --name swa-mane-haus-coming-soon \
  --resource-group rg-originhair-prod \
  --query "properties.apiKey" -o tsv
```

### Step 7: Add Deployment Tokens to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Add the following repository secrets:

| Secret Name | Value |
|------------|-------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_ORIGIN` | Token from Step 6 (Origin Hair) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_MANE_HAUS` | Token from Step 6 (Mane Haus) |

### Step 8: Trigger Deployment

The GitHub Actions workflows will trigger automatically on push to `main` when relevant files change. To trigger manually:

1. Go to **Actions** tab in GitHub
2. Select the workflow (e.g., "Deploy Origin Hair Collective Coming Soon")
3. Click **Run workflow**

---

## Part 2: Connecting Namecheap Domains

### Overview

To connect your Namecheap domains to Azure Static Web Apps, you need to:
1. Add the custom domain in Azure
2. Configure DNS records in Namecheap
3. Wait for SSL certificate provisioning (automatic)

### For Root Domain (e.g., originhair.com)

#### Step A: Add Custom Domain in Azure Portal

1. Go to **Azure Portal > Static Web Apps > swa-origin-coming-soon**
2. Click **Custom domains** in the left menu
3. Click **+ Add**
4. Enter your domain: `originhair.com`
5. Azure will show the required DNS records

#### Step B: Configure DNS in Namecheap

1. Log in to [Namecheap](https://www.namecheap.com)
2. Go to **Domain List > Manage** for `originhair.com`
3. Click **Advanced DNS** tab
4. Delete any existing A records or CNAME records for `@` (host)
5. Add the following records:

**For root domain validation (TXT record):**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | Value provided by Azure (for domain verification) | Automatic |

**For root domain routing (ALIAS/ANAME):**

Namecheap does not support ALIAS/ANAME records for root domains. You have two options:

**Option 1: Use `www` subdomain with redirect (Recommended)**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `<your-app>.azurestaticapps.net` | Automatic |

Then set up a redirect from `originhair.com` to `www.originhair.com`:
- In Namecheap: **Domain > Redirect Domain** section
- Add URL redirect: `originhair.com` -> `https://www.originhair.com`

**Option 2: Transfer DNS to Azure DNS (Full control)**

Transfer your domain's nameservers to Azure DNS for ALIAS record support:

```bash
# Create Azure DNS zone
az network dns zone create \
  --resource-group rg-originhair-prod \
  --name originhair.com

# Get Azure nameservers (use these in Namecheap)
az network dns zone show \
  --resource-group rg-originhair-prod \
  --name originhair.com \
  --query "nameServers" -o tsv
```

Then in Namecheap:
1. Go to **Domain List > Manage** for `originhair.com`
2. Under **Nameservers**, select **Custom DNS**
3. Enter the Azure nameservers (e.g., `ns1-01.azure-dns.com`, etc.)
4. Wait 24-48 hours for propagation

Then add an ALIAS record in Azure DNS:
```bash
az network dns record-set a create \
  --resource-group rg-originhair-prod \
  --zone-name originhair.com \
  --name "@" \
  --target-resource "/subscriptions/<sub-id>/resourceGroups/rg-originhair-prod/providers/Microsoft.Web/staticSites/swa-origin-coming-soon"
```

### For Subdomains (e.g., www.originhair.com)

Subdomains are simpler - just add a CNAME record in Namecheap:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `<your-app>.azurestaticapps.net` | Automatic |

### For Mane Haus (manehaus.com)

Repeat the same process for `manehaus.com`, pointing to `swa-mane-haus-coming-soon`:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | @ | Value provided by Azure (for domain verification) | Automatic |
| CNAME | www | `<your-mane-haus-app>.azurestaticapps.net` | Automatic |

#### Step C: Validate and Wait for SSL

1. After DNS records are configured, go back to Azure Portal
2. In **Custom domains**, click **Validate**
3. Azure will verify DNS and automatically provision a free SSL certificate
4. SSL provisioning takes 5-15 minutes
5. Once complete, your site will be accessible via `https://www.originhair.com`

---

## Part 3: Complete Checklist

### Azure Setup Checklist

- [ ] Azure CLI installed and logged in
- [ ] Resource group `rg-originhair-prod` created
- [ ] Static Web App for Origin Hair created (`swa-origin-coming-soon`)
- [ ] Static Web App for Mane Haus created (`swa-mane-haus-coming-soon`)
- [ ] Deployment tokens retrieved for both apps
- [ ] GitHub secrets added:
  - [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN_ORIGIN`
  - [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN_MANE_HAUS`
- [ ] GitHub Actions workflows triggered and deployed successfully

### Domain Setup Checklist

- [ ] **originhair.com**
  - [ ] Custom domain added in Azure Static Web App
  - [ ] TXT record added in Namecheap for verification
  - [ ] CNAME record added for `www` subdomain
  - [ ] Root domain redirect configured (originhair.com -> www.originhair.com)
  - [ ] SSL certificate provisioned (automatic)
  - [ ] Site accessible at `https://www.originhair.com`
- [ ] **manehaus.com**
  - [ ] Custom domain added in Azure Static Web App
  - [ ] TXT record added in Namecheap for verification
  - [ ] CNAME record added for `www` subdomain
  - [ ] Root domain redirect configured (manehaus.com -> www.manehaus.com)
  - [ ] SSL certificate provisioned (automatic)
  - [ ] Site accessible at `https://www.manehaus.com`

### Post-Deployment Checklist

- [ ] Update `environment.production.ts` files with actual API URL once backend is deployed
- [ ] Verify email signup form works on production sites
- [ ] Test all pages load correctly with proper styling
- [ ] Verify CORS is configured on API gateway for production domains

---

## Part 4: Environment Configuration

### API Base URL

The coming-soon apps need to know where the backend API is. This is configured via Angular environment files:

- **Development**: `src/environments/environment.ts` -> `http://localhost:5000`
- **Production**: `src/environments/environment.production.ts` -> `https://api.originhair.com`

When building for production (`ng build --configuration production`), Angular automatically swaps the environment file via `fileReplacements` in `angular.json`.

**Important**: Update `environment.production.ts` in all three apps with the actual production API URL once the backend is deployed.

### Files to Update Before First Production Deploy

| File | Update |
|------|--------|
| `projects/origin-hair-collective-coming-soon/src/environments/environment.production.ts` | Set `apiBaseUrl` to actual production API URL |
| `projects/main-haus-coming-soon/src/environments/environment.production.ts` | Set `apiBaseUrl` to actual production API URL |
| `projects/origin-hair-collective-admin/src/environments/environment.production.ts` | Set `apiBaseUrl` to actual production API URL |

---

## Part 5: Backend Deployment (Future)

The backend microservices are not yet deployed. When ready, the recommended approach is:

### Azure Container Apps with Aspire

.NET Aspire has built-in support for deploying to Azure Container Apps:

```bash
# Install Azure Developer CLI
winget install microsoft.azd

# Initialize Aspire deployment
cd src/Aspire/OriginHairCollective.AppHost
azd init

# Provision Azure resources and deploy
azd up
```

This will create:
- Azure Container Apps Environment
- Individual Container Apps for each microservice
- Azure Service Bus (replaces RabbitMQ)
- Azure Container Registry (for Docker images)
- Managed identities and networking

### Required Azure Resources for Backend

| Resource | Purpose |
|----------|---------|
| Azure Container Apps Environment | Hosts microservices |
| Azure Container Registry | Docker image storage |
| Azure Service Bus | Message broker (replaces RabbitMQ) |
| Azure SQL Database or PostgreSQL | Production database (replaces SQLite) |
| Azure Key Vault | Secrets management |
| Azure Application Insights | Monitoring and observability |

### CORS Configuration for Production

When the backend is deployed, update the API Gateway's CORS configuration in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "https://www.originhair.com",
                "https://originhair.com",
                "https://www.manehaus.com",
                "https://manehaus.com",
                "https://admin.originhair.com")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
```

---

## Troubleshooting

### GitHub Actions Deployment Fails

1. Check that secrets are correctly set in GitHub Settings
2. Verify the build succeeds locally: `cd src/OriginHairCollective.Web && npx ng build api && npx ng build components && npx ng build origin-hair-collective-coming-soon`
3. Check Actions logs for specific error messages

### Custom Domain Not Working

1. Verify DNS records are correct using: `nslookup www.originhair.com`
2. DNS propagation can take up to 48 hours
3. Check Azure Portal > Custom domains for validation status
4. Ensure TXT verification record is in place

### SSL Certificate Not Provisioning

1. Azure auto-provisions SSL after domain validation
2. Ensure CNAME record is correctly pointing to `*.azurestaticapps.net`
3. If stuck, remove and re-add the custom domain in Azure Portal

### Site Shows 404 After Deploy

1. Verify `staticwebapp.config.json` is included in the build output
2. Check that the `output-location` in the workflow matches the actual build output directory
3. For Angular SPA routing, the navigation fallback in `staticwebapp.config.json` must rewrite to `/index.html`
