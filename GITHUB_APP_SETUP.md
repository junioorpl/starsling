# GitHub App Setup Guide

This guide walks you through setting up the GitHub App with the correct permissions and webhook events for StarSling.

## Step 1: Access GitHub App Settings

1. Go to [GitHub Apps](https://github.com/settings/apps)
2. Find your StarSling app and click on it
3. Or navigate directly to: `https://github.com/settings/apps/[your-app-name]`

## Step 2: Configure Permissions

Click on **"Permissions & events"** in the left sidebar.

### Repository Permissions

Set the following permissions:

| Permission | Level | Reason |
|------------|-------|--------|
| **Contents** | Read | Access repository metadata and basic information |
| **Issues** | Read | Read issue data from webhooks and API |
| **Metadata** | Read | Access basic repository metadata |
| **Pull requests** | Read | For future PR management features |

### Organization Permissions

| Permission | Level | Reason |
|------------|-------|--------|
| **Members** | Read | Verify user access to organizations |

### Account Permissions

| Permission | Level | Reason |
|------------|-------|--------|
| **Email addresses** | Read | For user authentication (if using GitHub OAuth) |

## Step 3: Configure Webhook Events

In the same "Permissions & events" section, subscribe to these events:

### Required Events

- ✅ **Issues**
  - Actions: `opened`, `closed`, `edited`, `reopened`
  - Used for: Core issue tracking functionality

- ✅ **Installation**
  - Actions: `created`, `deleted`
  - Used for: App installation/uninstallation handling

- ✅ **Installation repositories**
  - Actions: `added`, `removed`
  - Used for: Repository access management

### Optional Events (for future features)

- ⚠️ **Repository**
  - Actions: `created`, `deleted`, `archived`, `unarchived`
  - Used for: Repository lifecycle management

## Step 4: Set Webhook URL

1. In the "General" section, set:
   - **Webhook URL**: `https://your-domain.com/api/github/webhook`
   - **Webhook secret**: Generate a secure secret and add it to your environment variables

## Step 5: Environment Variables

Make sure these environment variables are set in your deployment:

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_CLIENT_ID=your_client_id
GITHUB_APP_CLIENT_SECRET=your_client_secret
GITHUB_APP_SLUG=your_app_slug
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# GitHub OAuth (for BetterAuth)
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
```

## Step 6: Test the Configuration

1. **Install the app** on a test organization
2. **Check the webhook** by looking at the webhook deliveries in GitHub App settings
3. **Verify permissions** by checking if the app can access repository data
4. **Test issue events** by creating/updating issues in the test repository

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook secret matches environment variable
   - Check webhook delivery logs in GitHub App settings

2. **Permission denied errors**
   - Verify all required permissions are set
   - Check if the app is installed on the correct organization
   - Ensure the installation has access to the repositories

3. **Missing webhook events**
   - Verify all required events are subscribed
   - Check if the repository has issues enabled
   - Ensure the app has the correct permissions for the events

### Verification Checklist

- [ ] All required permissions are set to "Read"
- [ ] All required webhook events are subscribed
- [ ] Webhook URL is correct and accessible
- [ ] Webhook secret is set in environment variables
- [ ] App is installed on the target organization
- [ ] Test repository has issues enabled
- [ ] Webhook deliveries are successful in GitHub App settings

## Security Notes

- **Minimal permissions**: Only request the permissions you actually need
- **Read-only access**: The app only reads data, it doesn't modify repositories or issues
- **Secure webhooks**: Always use HTTPS for webhook URLs
- **Secret management**: Store webhook secrets securely and rotate them regularly
