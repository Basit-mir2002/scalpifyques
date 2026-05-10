# GASP-AI App

React Native (Expo) front-end for the GASP-AI FastAPI backend.

## Run

```bash
cd /Users/zaki/Downloads/gasp-ai-app
npx expo start
```

Press `i` for iOS simulator, `a` for Android, or scan the QR code with the Expo Go app.

## Backend URL

`LOCAL_LAN_IP` in [src/config.ts](src/config.ts) is pre-set to `192.168.1.10` (this machine's current LAN IP). Re-run `ifconfig | grep "inet "` if your IP changes. Android emulator uses `10.0.2.2` automatically.

> **Important:** restart the FastAPI server bound to `0.0.0.0` (not `127.0.0.1`) so a phone on the same Wi-Fi can reach it:
>
> ```bash
> cd /Users/zaki/Downloads/gasp-ai-microservices/api
> /Users/zaki/Downloads/gasp-ai-microservices/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
> ```

For production, replace `your-deployed-api.example.com` in `src/config.ts` with your deployed FastAPI URL.

## What's wired up

- **Pick photo** → `expo-image-picker`
- **Analyze** → `POST /api/v1/analyze` (multipart, ~2s)
- **Hair journey** → `POST /api/v1/hair-journey/generate` (multipart, ~60s, returns 3 stage URLs)
- **Image display** → Supabase public URLs rendered via `<Image source={{ uri }} />`

## Next steps

- Add Supabase Auth and pass `user_id` through
- Add a `/history` screen
- Add a before/after slider component
- Replace the simple buttons with proper navigation (Expo Router)
