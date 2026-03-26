export interface CallSession {
  id: string;
  direction: "incoming" | "outgoing";
  status: "ringing" | "answered" | "completed" | "missed" | "failed";
  from: string;
  to: string;
  contactName?: string;
  agentExtension: string;
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  actionstepMatterNumber?: string;
  notes?: string;
  actionstepLogStatus: "pending" | "logged" | "failed";
  actionstepLogId?: string;
}

export interface CallLogRecord {
  id: string;
  callSessionId: string;
  matterNumber: string;
  notes: string;
  loggedAt: string;
  direction: "incoming" | "outgoing";
  from: string;
  to: string;
  durationSeconds?: number;
  actionstepRecordId: string;
}
