export type CallDirection = "incoming" | "outgoing";

export type CallStatus =
  | "ringing"
  | "answered"
  | "completed"
  | "missed"
  | "failed";

export interface CallSession {
  id: string;
  externalCallId?: string;
  direction: CallDirection;
  status: CallStatus;
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
  direction: CallDirection;
  from: string;
  to: string;
  durationSeconds?: number;
  actionstepRecordId: string;
}
