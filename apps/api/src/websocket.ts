import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { CallLogRecord, CallSession } from "./types.js";

interface WebSocketMessage {
  type: "snapshot" | "call.updated" | "log.created";
  payload: unknown;
}

export class RealtimeServer {
  private wsServer: WebSocketServer;

  constructor(server: Server) {
    this.wsServer = new WebSocketServer({ server, path: "/ws" });
  }

  sendSnapshot(sessions: CallSession[], logs: CallLogRecord[]) {
    this.broadcast({
      type: "snapshot",
      payload: { sessions, logs },
    });
  }

  sendCallUpdated(session: CallSession) {
    this.broadcast({
      type: "call.updated",
      payload: session,
    });
  }

  sendLogCreated(log: CallLogRecord) {
    this.broadcast({
      type: "log.created",
      payload: log,
    });
  }

  private broadcast(message: WebSocketMessage) {
    const data = JSON.stringify(message);

    for (const client of this.wsServer.clients) {
      if (client.readyState === 1) {
        client.send(data);
      }
    }
  }
}
