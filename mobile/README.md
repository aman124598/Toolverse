# Mobile wrapper (Capacitor) — quick start

This project uses a hosted backend + Capacitor WebView wrapper (recommended initial approach).

1) Deploy your Next.js app (or API routes) to a public URL (Vercel, Netlify, etc.).

2) Install Capacitor and create a native project from the repo root:

```bash
npm install --save @capacitor/core @capacitor/cli
npx cap init Toolverse com.example.toolverse --web-dir=out
```

3) Configure `capacitor.config.ts` (or `capacitor.config.json`) to point to your hosted URL during development:

```ts
// Example capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.toolverse',
  appName: 'Toolverse',
  webDir: 'out',
  server: {
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: process.env.CAPACITOR_SERVER_URL?.startsWith('http://') ?? false,
  },
};

export default config;
```

For local Android emulator development, a common value is `http://10.0.2.2:3000`. For a physical device, use your machine's LAN IP or a public HTTPS URL.

4) Add platforms (Android/iOS):

```bash
npx cap add android
npx cap add ios
```

5) Use the adapter helpers in `src/lib/mobileAdapters.ts` from your components instead of directly calling `document` or `navigator` APIs. Example:

```ts
import Mobile from 'src/lib/mobileAdapters';

await Mobile.copyText('hello');
await Mobile.saveFile(pdfBytes, 'result.pdf');
```

6) Build and sync before opening the native IDE:

```bash
npm run build
npx next export # or ensure web assets exist in `out`
npx cap copy
npx cap open android
```

Notes
- This approach keeps heavy PDF processing on the hosted backend (recommended).
- Later, you can move specific `src/app/api/*` endpoints into native plugins or local JS code if needed.

CI / Automatic updates
- To have app users see website updates immediately without app store releases, configure the native WebView to load the hosted site by setting `CAPACITOR_SERVER_URL` to your deployed site URL. Then updates deployed to the web will appear inside the app automatically.
- For secure and controlled releases, it's common to deploy the web via CI (see the provided GitHub Actions workflow `.github/workflows/deploy-web.yml`) which requires the repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.

Example GitHub Actions behavior:
- On push to `main`, the workflow builds the Next.js app and deploys to Vercel.
- If `capacitor.config.ts`'s `server.url` points to the Vercel URL, the app will load the updated site immediately.

Security note: loading remote content means you must secure your API endpoints and avoid embedding sensitive secrets in the client. Keep API keys only on the server.
