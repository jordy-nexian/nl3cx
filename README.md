# NL3CX

Companion platform for 3CX + Actionstep call logging.

## What this MVP does

- Accepts call events from a 3CX adapter or simulator.
- Tracks active and recent calls.
- Broadcasts call updates to a frontend over WebSocket.
- Lets a user log a call against an Actionstep matter number with notes.
- Stores structured call logs locally and leaves a clean adapter point for real Actionstep writes.

## Project structure

- `apps/api` - Express API, WebSocket server, in-memory session tracking, local log persistence, adapter stubs.
- `apps/web` - Vite + React operator console for active calls and matter logging.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the API and web app:

```bash
npm run dev
```

3. Open the web app at `http://localhost:5173`.

4. Create a simulated inbound call:

```bash
curl -X POST http://localhost:4000/api/simulate/incoming \
  -H "Content-Type: application/json" \
  -d '{"from":"+441234567890","to":"Ext 101","agentExtension":"101","contactName":"Test Caller"}'
```

5. Log the call in the UI, or send follow-up status events through `POST /api/calls/events`.

## Next integration steps

- Replace the 3CX simulator with a real 3CX event listener using the Call Control API.
- Replace the Actionstep stub with authenticated `phonerecords` and optional `filenotes` writes.
- Add authentication and map users/extensions to Actionstep identities.
