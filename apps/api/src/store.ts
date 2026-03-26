import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import type { CallLogRecord, CallSession, CallStatus } from "./types.js";

const dataDirectory = path.resolve(process.cwd(), "data");
const logsFile = path.join(dataDirectory, "call-logs.json");

export class CallStore {
  private sessions = new Map<string, CallSession>();

  private logs: CallLogRecord[] = [];

  async init() {
    await mkdir(dataDirectory, { recursive: true });

    try {
      const file = await readFile(logsFile, "utf8");
      this.logs = JSON.parse(file) as CallLogRecord[];
    } catch {
      this.logs = [];
    }
  }

  listSessions() {
    return Array.from(this.sessions.values()).sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt),
    );
  }

  listLogs() {
    return [...this.logs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  }

  getSession(id: string) {
    return this.sessions.get(id);
  }

  upsertSession(
    partial: Omit<CallSession, "id" | "actionstepLogStatus"> & {
      id?: string;
      actionstepLogStatus?: CallSession["actionstepLogStatus"];
    },
  ) {
    const id = partial.id ?? nanoid();
    const existing = this.sessions.get(id);

    const merged: CallSession = {
      id,
      actionstepLogStatus: partial.actionstepLogStatus ?? existing?.actionstepLogStatus ?? "pending",
      ...existing,
      ...partial,
    };

    this.sessions.set(id, merged);
    return merged;
  }

  updateStatus(id: string, status: CallStatus, details?: Partial<CallSession>) {
    const existing = this.sessions.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: CallSession = {
      ...existing,
      ...details,
      status,
    };

    this.sessions.set(id, updated);
    return updated;
  }

  async addLogRecord(record: Omit<CallLogRecord, "id">) {
    const log: CallLogRecord = {
      id: nanoid(),
      ...record,
    };

    this.logs.unshift(log);
    await writeFile(logsFile, JSON.stringify(this.logs, null, 2));
    return log;
  }
}
