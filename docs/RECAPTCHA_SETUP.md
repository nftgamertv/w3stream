# reCAPTCHA v3 Setup Guide

This project uses **reCAPTCHA v3** for bot protection on the waitlist signup form. reCAPTCHA v3 is invisible to users and returns a score (0.0 - 1.0) indicating the likelihood that an interaction is from a bot.

## Prerequisites

You need to generate reCAPTCHA v3 keys from the Google reCAPTCHA Admin Console.

## Getting Your reCAPTCHA v3 Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "+" to create a new site
3. Fill in the form:
   - **Label**: Your project name (e.g., "w3Stream Waitlist")
   - **reCAPTCHA type**: Select **"reCAPTCHA v3"**
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - Your production domain (e.g., `w3stream.com`)
   - Accept the reCAPTCHA Terms of Service
4. Click "Submit"
5. You'll receive two keys:
   - **Site Key** (public key - safe to expose in frontend)
   - **Secret Key** (private key - must be kept secret on backend)

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# reCAPTCHA v3 Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix makes the site key available in the browser
- The secret key should **NEVER** have the `NEXT_PUBLIC_` prefix
- Never commit real keys to version control

## How It Works

### Frontend (src/app/(waitlist)/waitlist/signup/page.tsx)

1. The reCAPTCHA v3 script loads automatically when the component mounts
2. When the user submits the form, `grecaptcha.execute()` is called with the action `submit_waitlist`
3. This happens invisibly - no checkbox or challenge appears to the user
4. The token is sent to the backend with the form data

### Backend (src/app/api/waitlist/route.ts)

1. Receives the reCAPTCHA token from the frontend
2. Verifies the token with Google's API
3. Checks that the action matches `submit_waitlist`
4. Validates the score (default threshold: 0.5)
5. Rejects submissions with low scores

## Score Interpretation

reCAPTCHA v3 returns a score from 0.0 to 1.0:
- **1.0**: Very likely a good interaction
- **0.5**: Neutral (default threshold)
- **0.0**: Very likely a bot

You can adjust the score threshold in `src/app/api/waitlist/route.ts`:

```typescript
const scoreThreshold = 0.5; // Adjust this value as needed
```

**Recommendations:**
- Start with 0.5 and monitor your traffic
- Lower threshold (e.g., 0.3) = more permissive, fewer false positives
- Higher threshold (e.g., 0.7) = more strict, more false positives

## Actions

The current implementation uses the action name `submit_waitlist`. Actions help you:
- Get detailed breakdowns in the reCAPTCHA admin console
- Analyze different form submissions separately
- Detect context-specific abuse patterns

## Monitoring

Monitor your reCAPTCHA performance in the [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin):
- View score distribution
- See action-specific analytics
- Identify potential bot attacks
- Adjust your score threshold based on real data

## Troubleshooting

### "Invalid key type" Error
This means you're using v2 keys with v3 code (or vice versa). Generate new v3 keys from the admin console.

### Low scores for legitimate users
- Check if your site has accessibility issues
- Ensure users can interact naturally with your site
- Consider lowering the score threshold
- Monitor score distribution in the admin console

### "reCAPTCHA not loaded yet" Error
The script may not have loaded in time. This is handled automatically with retry logic, but you can add a loading state if needed.

## Migration from v2 to v3

If you're migrating from reCAPTCHA v2:

1. ✅ Generate new v3 keys (v2 keys won't work with v3)
2. ✅ Remove the `react-google-recaptcha` package
3. ✅ Update frontend to use `grecaptcha.execute()`
4. ✅ Update backend to verify scores and actions
5. ✅ Remove the checkbox UI component
6. ✅ Test thoroughly

## Security Best Practices

- ✅ Always verify tokens on the backend
- ✅ Check the action name matches your expected action
- ✅ Validate the score against your threshold
- ✅ Never trust frontend validation alone
- ✅ Keep your secret key secure
- ✅ Rotate keys if compromised
- ✅ Monitor for unusual score patterns

## Additional Resources

- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Best Practices Guide](https://developers.google.com/recaptcha/docs/v3#best_practices)
