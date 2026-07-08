YouTube playlist sync functions
=================================

Overview
--------
This module keeps a public YouTube playlist in sync with the channel uploads:

- `youtubeChannelWebhook` — WebSub (PubSubHubbub) callback which receives near real-time notifications from YouTube and inserts new uploads into the public playlist.
- `atualizarPlaylistYoutube` — HTTP endpoint that performs a manual backfill: lists all uploads and inserts missing videos into the public playlist.
- `atualizarPlaylistYoutubeScheduled` — hourly scheduled search that checks recent channel videos and active live streams, then inserts missing items into the playlist.
- `processarTranscricoesYoutubeScheduled` — hourly job that processes videos queued for transcription after a 3-hour delay.
- `obterTranscricaoYoutube` — public endpoint consumed by the React player to display a saved video transcript.
- `renovarWebhookYoutube` — HTTP endpoint that renews the YouTube WebSub subscription.
- `renovarWebhookYoutubeScheduled` — renews that subscription every 3 days.
- `listarVideosTvCamara` — public endpoint consumed by the React app to load the synchronized playlist.

Requirements
------------
- Firebase project (the same used by CMPacatubaApp is fine).
- OAuth credentials for a Google Cloud project with YouTube Data API enabled.
  - `CLIENT_ID`, `CLIENT_SECRET`, and a `REFRESH_TOKEN` (offline access) for the channel account.

Environment / Secrets
---------------------
Set the following environment variables / functions config before deploying (do NOT commit secrets to source control):

- `YOUTUBE_CLIENT_ID` (local fallback)
- `YOUTUBE_CLIENT_SECRET` (local fallback)
- `YOUTUBE_REFRESH_TOKEN` (local fallback)
- `YOUTUBE_CHANNEL_ID` — the channel id (ex: UCDIm8G-...)
- `YOUTUBE_PLAYLIST_ID` — the public playlist id to maintain
- `YOUTUBE_WEBHOOK_VERIFY_TOKEN` — random token used to verify WebSub subscribes
- `YOUTUBE_WEBHOOK_CALLBACK_URL` — optional explicit callback URL. If omitted, the function uses `https://southamerica-east1-cm-pacatuba.cloudfunctions.net/youtubeChannelWebhook`

Examples (Firebase CLI)

Set env vars using `firebase functions:config:set` or through the Secrets manager:

firebase functions:config:set youtube.client_id="YOUR_CLIENT_ID" youtube.client_secret="YOUR_CLIENT_SECRET" youtube.refresh_token="YOUR_REFRESH_TOKEN" youtube.channel_id="YOUR_CHANNEL_ID" youtube.playlist_id="YOUR_PLAYLIST_ID" youtube.webhook_verify_token="SOME_RANDOM"

For local emulator testing, you can also set the env vars directly:

export YOUTUBE_CLIENT_ID=...
export YOUTUBE_CLIENT_SECRET=...
export YOUTUBE_REFRESH_TOKEN=...
export YOUTUBE_CHANNEL_ID=...
export YOUTUBE_PLAYLIST_ID=...
export YOUTUBE_WEBHOOK_VERIFY_TOKEN=...

If your normal Firebase CLI auth is invalid, you can generate a service account token with a Firebase service account key:

cd functions
TOKEN=$(./scripts/get-firebase-sa-token.sh)
npx firebase-tools@9.2.0 --project=cm-pacatuba --token "$TOKEN" functions:config:set youtube.client_id="YOUR_CLIENT_ID" youtube.client_secret="YOUR_CLIENT_SECRET" youtube.refresh_token="YOUR_REFRESH_TOKEN" youtube.channel_id="YOUR_CHANNEL_ID" youtube.playlist_id="YOUR_PLAYLIST_ID" youtube.webhook_verify_token="SOME_RANDOM"

The `youtube.webhook_verify_token` is not provided by Google — you choose a secret value yourself, such as `my-webhook-secret-123`, and use that same value when subscribing the callback URL to YouTube's PubSubHubbub.

Generate the refresh token
--------------------------

From the `functions` directory run:

npm run youtube:refresh-token

Then follow the script instructions:

1. Paste your `CLIENT_ID`.
2. Paste your `CLIENT_SECRET`.
3. Open the displayed URL in a browser.
4. Authorize the application with `https://www.googleapis.com/auth/youtube`.
5. Paste back the authorization code or the full redirect URL shown in your browser.

The script will print the `refresh_token` to use as `youtube.refresh_token`.

Or set OS env vars for local emulator testing:

export YOUTUBE_CLIENT_ID=...
export YOUTUBE_CLIENT_SECRET=...
export YOUTUBE_REFRESH_TOKEN=...
export YOUTUBE_CHANNEL_ID=...
export YOUTUBE_PLAYLIST_ID=...
export YOUTUBE_WEBHOOK_VERIFY_TOKEN=...

Deploy
------
From the repository root:

cd functions
npm install
firebase deploy --only functions:youtubeChannelWebhook,functions:atualizarPlaylistYoutube,functions:atualizarPlaylistYoutubeScheduled,functions:processarTranscricoesYoutubeScheduled,functions:renovarWebhookYoutube,functions:renovarWebhookYoutubeScheduled,functions:listarVideosTvCamara,functions:obterTranscricaoYoutube

This repository is configured with `.firebaserc` default project `cm-pacatuba`.

Troubleshooting redirect_uri_mismatch
-------------------------------------
If you see `redirect_uri_mismatch` when generating the refresh token, do this:

1. Open Google Cloud Console.
2. Go to APIs & Services > Credentials.
3. Edit your OAuth 2.0 Client ID.
4. Add the redirect URI shown by the script, normally:

   http://localhost

5. Save the OAuth client.
6. Run the refresh-token generator again.

If you need a different redirect URI, set it before running the script:

```bash
export REDIRECT_URI="http://localhost"
npm run youtube:refresh-token
```

Invalid grant errors
--------------------
If you see `invalid_grant` when exchanging the authorization code, this usually means one of these situations:

- the authorization code expired (codes are short-lived)
- the code was already used once
- the redirect URI in the OAuth client does not match the one shown by the script
- you did not use the latest authorization code URL

Solution: generate a brand-new code, copy the full redirect URL immediately after authorization, and paste it into the prompt.

After deploy
------------
Run the manual endpoints once after configuring credentials:

```bash
curl https://southamerica-east1-cm-pacatuba.cloudfunctions.net/renovarWebhookYoutube
curl https://southamerica-east1-cm-pacatuba.cloudfunctions.net/atualizarPlaylistYoutube
```

Notes
-----
- The endpoint `youtubeChannelWebhook` is subscribed to YouTube WebSub by `renovarWebhookYoutube`.
- The functions use Firestore collection `youtubePlaylistVideos` as a cache to avoid inserting the same video multiple times.
- The functions perform `playlistItems.insert` and therefore require OAuth credentials. API key only cannot modify playlists.
- The React app first reads `listarVideosTvCamara` and only falls back to the public YouTube API if the Function is unavailable.

If you want, I can add a helper script to create the webhook subscription and a Cloud Scheduler job example — tell me which option you prefer (Cloud Scheduler, Firebase onSchedule, or manual subscribe script).
