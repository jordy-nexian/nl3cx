import { nanoid } from "nanoid";
import type { CallSession } from "./types.js";

export interface ActionstepLogPayload {
  matterNumber: string;
  notes: string;
  session: CallSession;
}

export interface ActionstepAdapter {
  logPhoneRecord(payload: ActionstepLogPayload): Promise<{ recordId: string }>;
}

export class StubActionstepAdapter implements ActionstepAdapter {
  async logPhoneRecord(_payload: ActionstepLogPayload) {
    return {
      recordId: `stub-${nanoid(10)}`,
    };
  }
}
