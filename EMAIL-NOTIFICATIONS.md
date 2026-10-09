# Team email notifications

The site sends team alerts for contact enquiries, consultation bookings,
quote requests and client support requests after the request is saved.
Next.js `after` runs the email task after the response so delivery does not
slow the client form. A failed email never deletes the saved request or
changes the submission into an error. Requests remain available in the
admin dashboard. Failures are logged; automatic retries are not implemented.

## Configuration

Set the following in your local `.env` and Vercel production environment:

```dotenv
RESEND_API_KEY="your-existing-key"
CONTACT_FROM_EMAIL="Rennovex Technology <notifications@your-domain>"
CONTACT_NOTIFICATION_EMAIL="rennovextechnology@gmail.com"
APP_URL="https://your-production-domain"
```

Use a sender from a domain verified in your Resend account.
`CONTACT_FROM_EMAIL` falls back to `RESEND_FROM_EMAIL`.
`CONTACT_NOTIFICATION_EMAIL` overrides the notification destination. When
empty, alerts go to `rennovextechnology@gmail.com`. Site Settings contact
email controls the public contact information separately.
`APP_URL` falls back to `NEXT_PUBLIC_SITE_URL` for dashboard links.
Do not put API keys in variables prefixed with `NEXT_PUBLIC_`.

Notifications contain the submitted details and a dashboard link. Reply-to
uses the client's email, allowing your team to reply from its inbox.
The preferred consultation date is labelled UTC; a booking alert is a
request for a time, not confirmation that the appointment is accepted.
The new alerts go to the team, not the client. Existing invitation and
password-reset emails are unchanged.

## Verification

Run `npm run test:notifications` for mocked request and delivery checks.
No real email is sent by this test.

After starting the production build locally, submit one enquiry, booking,
quote and support request using a test client account. Confirm each is
saved, the correct inbox receives its alert, the dashboard link opens,
and replying addresses the client. Check spam and Resend delivery records.
Repeat on the deployed site after updating Vercel environment variables.
Provider acceptance does not by itself confirm inbox delivery.

## Company inbox setup

Create your Resend account with `rennovextechnology@gmail.com`.
For initial alerts to this account email, you can use:

```dotenv
CONTACT_FROM_EMAIL="Rennovex Website <onboarding@resend.dev>"
CONTACT_NOTIFICATION_EMAIL="rennovextechnology@gmail.com"
```

Replace any old recipient value in your existing `.env` and Vercel variables;
existing values take precedence over defaults. Set Site Settings → Contact
Email to the same company inbox. No existing database settings are overwritten.
Keep your current `ADMIN_EMAIL`, password, database URLs and auth secret.
Use your new Resend API key in `RESEND_API_KEY`.

The onboarding sender is for testing to your Resend account email. Invitations
and password resets to other clients still require a verified sender domain.
After verifying it, set CONTACT_FROM_EMAIL, ADMIN_FROM_EMAIL and
RESEND_FROM_EMAIL to senders from that domain.
