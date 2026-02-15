# Custom Domain Setup: www.originhaircollective.com → Azure Container Apps

Connect your Namecheap domain `www.originhaircollective.com` to the OHC Coming Soon app running on Azure Container Apps.

**Azure Container App:** `coming-soon`
**Resource Group:** `rg-ohc-coming-soon`
**Current URL:** `https://coming-soon.icycoast-688f1dc5.eastus2.azurecontainerapps.io/`

---

## Step 1: Add the Custom Domain in Azure Portal

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Resource Groups** → `rg-ohc-coming-soon` → `coming-soon` (Container App)
3. In the left sidebar, click **Custom domains**
4. Click **+ Add custom domain**
5. Enter `www.originhaircollective.com` as the domain
6. Select **CNAME** as the record type
7. Azure will display a **verification record** — you'll need two values:
   - **CNAME target:** `coming-soon.icycoast-688f1dc5.eastus2.azurecontainerapps.io`
   - **Domain verification TXT value:** (a code like `asuid.www` with a long hash — copy this exactly)

**Do NOT click Validate yet.** First complete Step 2.

---

## Step 2: Add DNS Records in Namecheap

1. Log in to [Namecheap](https://www.namecheap.com/) and go to **Domain List**
2. Click **Manage** next to `originhaircollective.com`
3. Go to the **Advanced DNS** tab
4. Add the following two records:

### Record 1: CNAME Record

| Field    | Value                                                                  |
|----------|------------------------------------------------------------------------|
| Type     | CNAME Record                                                           |
| Host     | `www`                                                                  |
| Value    | `coming-soon.icycoast-688f1dc5.eastus2.azurecontainerapps.io`         |
| TTL      | Automatic                                                              |

### Record 2: TXT Record (Domain Verification)

| Field    | Value                                                                  |
|----------|------------------------------------------------------------------------|
| Type     | TXT Record                                                             |
| Host     | `asuid.www`                                                            |
| Value    | *(paste the Domain verification TXT value from Azure — Step 1)*        |
| TTL      | Automatic                                                              |

5. Click the **checkmark** to save each record
6. If there is an existing CNAME or A record for `www`, delete it first

---

## Step 3: Wait for DNS Propagation

DNS changes can take **5–30 minutes** (sometimes up to 48 hours, but usually fast).

Verify propagation:
- Visit https://dnschecker.org and look up `www.originhaircollective.com` for CNAME records
- Confirm it resolves to `coming-soon.icycoast-688f1dc5.eastus2.azurecontainerapps.io`

---

## Step 4: Validate the Domain in Azure

1. Go back to the Azure Portal → `coming-soon` Container App → **Custom domains**
2. Click **Validate** on the pending `www.originhaircollective.com` entry
3. If validation succeeds, Azure will automatically provision a **free managed SSL certificate**
4. Click **Add** to complete the binding

If validation fails, double-check:
- The CNAME record `Host` is `www` (not `www.originhaircollective.com`)
- The TXT record `Host` is `asuid.www` (not the full domain)
- DNS has had time to propagate

---

## Step 5: Verify SSL Certificate

1. In the Azure Portal, go to `coming-soon` → **Custom domains**
2. The certificate status should show **Securing** and then change to **Secured**
3. This can take **5–15 minutes** for the certificate to be issued and bound

---

## Step 6: Test

1. Open https://www.originhaircollective.com in your browser
2. Verify the page loads (Origin Hair Collective coming soon page)
3. Verify the padlock icon shows a valid SSL certificate
4. Test the newsletter signup to confirm API calls work through the custom domain

---

## Optional: Redirect Root Domain to WWW

If you also want `originhaircollective.com` (without www) to redirect to `www.originhaircollective.com`:

1. In Namecheap **Advanced DNS**, add a **URL Redirect Record**:

| Field    | Value                                          |
|----------|-------------------------------------------------|
| Type     | URL Redirect Record                             |
| Host     | `@`                                             |
| Value    | `https://www.originhaircollective.com`          |
| Type     | Permanent (301)                                 |

This redirects visitors who type `originhaircollective.com` to the www version.

---

## Summary of DNS Records

| Type  | Host        | Value                                                                    |
|-------|-------------|--------------------------------------------------------------------------|
| CNAME | `www`       | `coming-soon.icycoast-688f1dc5.eastus2.azurecontainerapps.io`           |
| TXT   | `asuid.www` | *(verification code from Azure Portal)*                                  |

---

## Troubleshooting

**"Domain verification failed"**
- Ensure the TXT record host is `asuid.www`, not `asuid.www.originhaircollective.com`
- Namecheap auto-appends the domain, so only enter `asuid.www`
- Wait 10 minutes and retry validation

**"Certificate provisioning failed"**
- Ensure the CNAME record is pointing correctly
- Check that no CAA records on the domain block certificate issuance
- Azure uses DigiCert — if you have CAA records, add `digicert.com`

**Site loads but API calls fail**
- The nginx reverse proxy in the container handles `/api/*` routing
- Check that the API Gateway container app is running in Azure Portal
