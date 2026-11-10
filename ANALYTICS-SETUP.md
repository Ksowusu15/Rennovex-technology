# Rennovex Website Analytics setup

The admin sidebar now includes **Website Analytics** for SUPER_ADMIN and ADMIN roles at `/admin/analytics`.

## Connect Google Analytics Data API

1. In Google Analytics, go to **Admin → Property details** and copy the numeric **Property ID** (not the web stream ID `16311400044` and not `G-82EHEQDNQW`).
2. In Google Cloud Console, enable **Google Analytics Data API**, create a service account and download its JSON credentials.
3. In GA4 Admin → Property access management, add the service account email with **Viewer** access.
4. Set `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL` and `GA_PRIVATE_KEY` in local `.env` and Vercel environment variables. For the private key, use the `private_key` from the JSON; preserve newlines or represent them as `\n`. Never commit the JSON or secrets.
5. Redeploy and open `/admin/analytics`. Choose 7, 30 or 90 days. If setup is incomplete, the page displays a useful error rather than fabricated data.

## Tracking configuration

Your GA4 web stream Measurement ID is `G-82EHEQDNQW`. Your selected Google Tag Manager container is `GTM-M3N7D49S`. Publishing a Google tag inside GTM is a separate step from enabling the reporting API. Avoid installing the same GA4 tag twice.

The analytics dashboard **reads** data only. It does not install tracking tags or create events. Configure the relevant events in GTM and test them with Tag Assistant. The dashboard deliberately does not expose service account credentials to the browser. The Analytics Data API is not a realtime feed; use GA4 Realtime for live visitor counts.
