# OneBigShowOTT Production Launch Checklist

This document outlines the steps needed to launch the OneBigShowOTT app in production with the subscription system fully enabled.

## Pre-Launch Checklist

- [ ] Environment variables configured in `.env.production`
- [ ] Edge Functions deployed to production
- [ ] RLS policies configured correctly
- [ ] Payment gateway webhooks configured
- [ ] Subscription plans created in database
- [ ] Monitoring and alerts set up
- [ ] App builds tested and ready

## Launch Steps

1. **Deploy Edge Functions to Production**

   ```bash
   # Deploy using MCP tool
   mcp deploy --profile production
   ```

2. **Configure Payment Gateway Webhooks**

   - Log in to Lightspeed dashboard
   - Go to Developers > Webhooks
   - Configure webhook URL: `https://hjsdcsatfcysrwsryngu.supabase.co/functions/v1/confirm-subscription`
   - Set the webhook secret in your production environment

3. **Verify Edge Functions**

   ```bash
   # Run verification script
   NODE_ENV=production node scripts/verify-subscription-system.js --prod
   ```

4. **Build and Deploy Mobile App**

   ```bash
   # Build for production
   eas build --platform all --profile production
   
   # Submit to app stores
   eas submit --platform all --profile production
   ```

5. **Run Final Smoke Tests**

   ```bash
   # Run smoke tests against production
   NODE_ENV=production node scripts/smoke-test-production.js
   ```

## Post-Launch Monitoring

- Monitor Edge Function logs in Supabase Dashboard
- Check Slack channel for any alerts
- Verify webhook events are being received and processed
- Monitor subscription sign-ups and completions

## Troubleshooting

### Common Issues

1. **Payment Gateway Errors**
   - Check webhook URLs and secrets
   - Verify Lightspeed credentials in production environment
   - Check Edge Function logs for detailed error messages

2. **Subscription Not Activating**
   - Check `confirm-subscription` function logs
   - Verify webhook is being called by payment gateway
   - Check database for subscription records

3. **App Authentication Issues**
   - Verify Supabase URL and anon key in production build
   - Check auth logs in Supabase Dashboard

## Rollback Plan

If critical issues are found after launch:

1. Disable subscription purchases in the app
2. Revert to previous build if necessary
3. Restore database to pre-launch state if needed

## Contact Information

- **Technical Support**: tech@onebigshow.com
- **Payment Gateway Support**: support@lightspeed.com
- **Emergency Contact**: emergency@onebigshow.com 