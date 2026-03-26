import { createServer } from "node:http";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { StubActionstepAdapter } from "./actionstep.js";
import { CallStore } from "./store.js";
import { RealtimeServer } from "./websocket.js";

dotenv.config({ path: pathForEnv() });

function pathForEnv() {
  return new URL("../../../.env", import.meta.url).pathname;
}

const eventSchema = z.object({
  callId: z.string().min(1),
  direction: z.enum(["incoming", "outgoing"]),
  status: z.enum(["ringing", "answered", "completed", "missed", "failed"]),
  from: z.string().min(1),
  to: z.string().min(1),
  contactName: z.string().optional(),
  agentExtension: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
});

const logSchema = z.object({
  matterNumber: z.string().min(1),
  notes: z.string().min(1),
});

const simulateIncomingSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  agentExtension: z.string().min(1),
  contactName: z.string().optional(),
});

const app = express();
const store = new CallStore();
const actionstep = new StubActionstepAdapter();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/calls", (_req, res) => {
  res.json(store.listSessions());
});

app.get("/api/logs", (_req, res) => {
  res.json(store.listLogs());
});

app.post("/api/calls/events", (req, res) => {
  const parsed = eventSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const payload = parsed.data;
  const timestamp = payload.timestamp ?? new Date().toISOString();
  const existing = store.getSession(payload.callId);

  const session = store.upsertSession({
    id: payload.callId,
    externalCallId: payload.callId,
    direction: payload.direction,
    status: payload.status,
    from: payload.from,
    to: payload.to,
    contactName: payload.contactName,
    agentExtension: payload.agentExtension,
    startedAt: existing?.startedAt ?? timestamp,
    answeredAt: payload.status === "answered" ? timestamp : existing?.answeredAt,
    endedAt:
      payload.status === "completed" ||
      payload.status === "missed" ||
      payload.status === "failed"
        ? timestamp
        : existing?.endedAt,
    durationSeconds: payload.durationSeconds ?? existing?.durationSeconds,
  });

  realtime.sendCallUpdated(session);
  return res.status(202).json(session);
});

app.post("/api/calls/:id/log", async (req, res) => {
  const parsed = logSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const session = store.getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Call session not found" });
  }

  const actionstepResult = await actionstep.logPhoneRecord({
    matterNumber: parsed.data.matterNumber,
    notes: parsed.data.notes,
    session,
  });

  const updatedSession = store.upsertSession({
    ...session,
    actionstepMatterNumber: parsed.data.matterNumber,
    notes: parsed.data.notes,
    actionstepLogStatus: "logged",
    actionstepLogId: actionstepResult.recordId,
  });

  const log = await store.addLogRecord({
    callSessionId: session.id,
    matterNumber: parsed.data.matterNumber,
    notes: parsed.data.notes,
    loggedAt: new Date().toISOString(),
    direction: session.direction,
    from: session.from,
    to: session.to,
    durationSeconds: session.durationSeconds,
    actionstepRecordId: actionstepResult.recordId,
  });

  realtime.sendCallUpdated(updatedSession);
  realtime.sendLogCreated(log);

  return res.status(201).json({
    session: updatedSession,
    log,
  });
});

app.post("/api/simulate/incoming", async (req, res) => {
  const parsed = simulateIncomingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const callId = `sim-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const session = store.upsertSession({
    id: callId,
    externalCallId: callId,
    direction: "incoming",
    status: "answered",
    from: parsed.data.from,
    to: parsed.data.to,
    contactName: parsed.data.contactName,
    agentExtension: parsed.data.agentExtension,
    startedAt: timestamp,
    answeredAt: timestamp,
  });

  realtime.sendCallUpdated(session);
  return res.status(201).json(session);
});

const httpServer = createServer(app);
const realtime = new RealtimeServer(httpServer);

await store.init();

const port = Number(process.env.API_PORT ?? 4000);
httpServer.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
