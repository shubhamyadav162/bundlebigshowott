# OneBigShowOTT Subscription System - Production Guide

This document provides information on managing the OneBigShowOTT subscription system in production.

## Table of Contents
- [System Overview](#system-overview)
- [Managing Subscription Plans](#managing-subscription-plans)
- [Payment Gateway Integration](#payment-gateway-integration)
- [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
- [Deployment Guide](#deployment-guide)

## System Overview

The OneBigShowOTT subscription system consists of:
- Supabase Database (subscriptions and subscription_plans tables)
- Edge Functions for payment processing and subscription management
- Frontend components for user subscription flow
- Admin dashboard for subscription management

## Managing Subscription Plans

### Adding New Plans

To add a new subscription plan:

1. Access the Supabase Dashboard > Table Editor > subscription_plans
2. Click "Insert Row" and fill in the following fields:
   - `id`: Auto-generated UUID
   - `name`: Plan name (e.g., "Premium Monthly")
   - `description`: Short description of the plan
   - `price`: Price in INR (e.g., 299)
   - `currency`: Currency code (default: "INR")
   - `interval`: Billing interval ("monthly" or "yearly")
   - `features`: JSON array of features (e.g., `["HD Streaming", "Unlimited Movies"]`)
   - `active`: Boolean indicating if plan is active (default: true)

Example SQL query to add a new plan:

```sql
INSERT INTO subscription_plans (name, description, price, currency, interval, features, active) 
VALUES (
  'Premium Annual', 
  'Annual Premium subscription with 2 months free', 
  2999, 
  'INR', 
  'yearly', 
  '["4K Streaming", "Unlimited Movies", "Offline Downloads", "2 Months Free"]',
  true
);
```

### Updating Existing Plans

To update an existing plan:

1. Access the Supabase Dashboard > Table Editor > subscription_plans
2. Find the plan you want to update and click "Edit"
3. Make your changes and click "Save"

Important: Setting a plan's `active` field to `false` will hide it from new subscriptions but won't affect existing subscriptions.

## Payment Gateway Integration

### Webhook Configuration

The production payment gateway requires webhook endpoints to be configured:

1. Login to your Lightspeed payment gateway dashboard
2. Navigate to Developers > Webhooks 
3. Add the following webhooks:
   - **Payment Successful**: `https://<your-domain>/functions/v1/confirm-subscription`
   - **Payment Failed**: `https://<your-domain>/functions/v1/payment-failed` (optional)
   - **Subscription Cancelled**: `https://<your-domain>/functions/v1/cancel-subscription` (optional)

### Testing Webhooks

To verify webhooks are correctly set up:

1. In the Lightspeed dashboard, use the "Test webhook" feature
2. Check Supabase logs for successful webhook reception
3. Verify the test data is properly processed by the edge functions

## Monitoring and Troubleshooting

### Logs and Monitoring

To access logs and monitor the subscription system:

1. **Edge Function Logs**: Supabase Dashboard > Edge Functions > Logs
2. **Database Logs**: Supabase Dashboard > SQL Editor > Run `SELECT * FROM postgres_logs;`
3. **Verification Script**: Run `NODE_ENV=production node scripts/verify-subscription-system.js --prod`

Automated monitoring runs daily via GitHub Actions and alerts are sent to Slack.

### Common Errors and Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired JWT | Check authentication flow and token expiration |
| 403 Forbidden | Missing RLS policies | Verify RLS policies for subscriptions table |
| 500 Internal Server | Edge function error | Check edge function logs for detailed error message |
| Payment Not Confirmed | Webhook not received | Verify payment gateway webhook configuration |

## Deployment Guide

To deploy changes to the subscription system:

1. **Update Edge Functions**:
   ```bash
   # Using MCP tool
   mcp deploy --profile production
   ```

2. **Database Migrations**:
   ```bash
   # Using MCP tool for migrations
   mcp apply-migrations --profile production
   ```

3. **Frontend Updates**:
   ```bash
   # Update environment variables
   cp .env.production .env.local
   
   # Build and deploy
   npm run build
   npm run deploy
   ```

4. **Verify Deployment**:
   ```bash
   # Run verification script
   NODE_ENV=production node scripts/verify-subscription-system.js --prod
   ```

---

For additional assistance, contact the development team. 