import { useEffect, useMemo, useState } from "react";
import { CallCard } from "./components/CallCard";
import { LogForm } from "./components/LogForm";
import { connectRealtime, fetchCalls, fetchLogs } from "./lib/api";
import type { CallLogRecord, CallSession } from "./lib/types";

interface RealtimeMessage {
  type: "snapshot" | "call.updated" | "log.created";
  payload: unknown;
}

export function App() {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [logs, setLogs] = useState<CallLogRecord[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string>();

  useEffect(() => {
    void Promise.all([fetchCalls(), fetchLogs()]).then(([nextCalls, nextLogs]) => {
      setCalls(nextCalls);
      setLogs(nextLogs);
      setSelectedCallId((current) => current ?? nextCalls[0]?.id);
    });

    const socket = connectRealtime((rawMessage) => {
      const message = rawMessage as RealtimeMessage;

      if (message.type === "snapshot") {
        const snapshot = message.payload as { sessions: CallSession[]; logs: CallLogRecord[] };
        setCalls(snapshot.sessions);
        setLogs(snapshot.logs);
        setSelectedCallId((current) => current ?? snapshot.sessions[0]?.id);
      }

      if (message.type === "call.updated") {
        const session = message.payload as CallSession;
        setCalls((current) => {
          const existingIndex = current.findIndex((item) => item.id === session.id);
          if (existingIndex === -1) {
            return [session, ...current];
          }

          const next = [...current];
          next[existingIndex] = session;
          return next.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
        });

        setSelectedCallId((current) => current ?? session.id);
      }

      if (message.type === "log.created") {
        const log = message.payload as CallLogRecord;
        setLogs((current) => [log, ...current]);
      }
    });

    return () => socket.close();
  }, []);

  const selectedCall = useMemo(
    () => calls.find((call) => call.id === selectedCallId),
    [calls, selectedCallId],
  );

  const pendingCalls = calls.filter((call) => call.actionstepLogStatus !== "logged");

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">3CX + Actionstep companion platform</p>
          <h1>Capture the call, then log it against the right matter.</h1>
          <p className="hero-copy">
            This shell is ready for your frontend polish. The backend is already tracking calls,
            pushing real-time updates, and accepting matter logs.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="label">Pending logs</span>
            <strong>{pendingCalls.length}</strong>
          </div>
          <div className="stat-card">
            <span className="label">Logged calls</span>
            <strong>{logs.length}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <section className="panel">
          <div className="panel-header">
            <h2>Active and recent calls</h2>
            <span>{calls.length} total</span>
          </div>

          <div className="call-list">
            {calls.length === 0 ? (
              <p className="empty-state">No calls yet. Use the simulator endpoint to create one.</p>
            ) : (
              calls.map((call) => (
                <CallCard
                  key={call.id}
                  call={call}
                  selected={call.id === selectedCallId}
                  onSelect={setSelectedCallId}
                />
              ))
            )}
          </div>
        </section>

        <LogForm call={selectedCall} onSaved={async () => setCalls(await fetchCalls())} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent matter logs</h2>
        </div>
        <div className="log-table">
          {logs.length === 0 ? (
            <p className="empty-state">No Actionstep logs have been created yet.</p>
          ) : (
            logs.map((log) => (
              <article key={log.id} className="log-row">
                <div>
                  <span className="label">Matter</span>
                  <strong>{log.matterNumber}</strong>
                </div>
                <div>
                  <span className="label">Call</span>
                  <strong>{log.from} {"->"} {log.to}</strong>
                </div>
                <div>
                  <span className="label">Record</span>
                  <strong>{log.actionstepRecordId}</strong>
                </div>
                <p>{log.notes}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
