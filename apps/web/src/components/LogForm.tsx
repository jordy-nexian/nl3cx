import { useEffect, useState } from "react";
import { logCall } from "../lib/api";
import type { CallSession } from "../lib/types";

interface LogFormProps {
  call?: CallSession;
  onSaved: () => void;
}

export function LogForm({ call, onSaved }: LogFormProps) {
  const [matterNumber, setMatterNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMatterNumber(call?.actionstepMatterNumber ?? "");
    setNotes(call?.notes ?? "");
    setError(null);
  }, [call]);

  if (!call) {
    return (
      <section className="panel panel--detail">
        <h2>Call details</h2>
        <p>Select a call to start logging it against a matter.</p>
      </section>
    );
  }

  const activeCall = call;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await logCall(activeCall.id, { matterNumber, notes });
      onSaved();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to save call log",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel panel--detail">
      <h2>Log call</h2>
      <div className="detail-grid">
        <div>
          <span className="label">Caller</span>
          <strong>{call.contactName ?? call.from}</strong>
        </div>
        <div>
          <span className="label">Direction</span>
          <strong>{call.direction}</strong>
        </div>
        <div>
          <span className="label">From</span>
          <strong>{call.from}</strong>
        </div>
        <div>
          <span className="label">To</span>
          <strong>{call.to}</strong>
        </div>
      </div>

      <form className="log-form" onSubmit={handleSubmit}>
        <label>
          <span className="label">Matter number</span>
          <input
            value={matterNumber}
            onChange={(event) => setMatterNumber(event.target.value)}
            placeholder="AS-12345"
            required
          />
        </label>

        <label>
          <span className="label">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Call summary, follow-up, next step..."
            rows={7}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Log against matter"}
        </button>
      </form>
    </section>
  );
}
