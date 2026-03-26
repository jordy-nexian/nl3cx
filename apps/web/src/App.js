import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { CallCard } from "./components/CallCard";
import { LogForm } from "./components/LogForm";
import { connectRealtime, fetchCalls, fetchLogs } from "./lib/api";
export function App() {
    const [calls, setCalls] = useState([]);
    const [logs, setLogs] = useState([]);
    const [selectedCallId, setSelectedCallId] = useState();
    useEffect(() => {
        void Promise.all([fetchCalls(), fetchLogs()]).then(([nextCalls, nextLogs]) => {
            setCalls(nextCalls);
            setLogs(nextLogs);
            setSelectedCallId((current) => current ?? nextCalls[0]?.id);
        });
        const socket = connectRealtime((rawMessage) => {
            const message = rawMessage;
            if (message.type === "snapshot") {
                const snapshot = message.payload;
                setCalls(snapshot.sessions);
                setLogs(snapshot.logs);
                setSelectedCallId((current) => current ?? snapshot.sessions[0]?.id);
            }
            if (message.type === "call.updated") {
                const session = message.payload;
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
                const log = message.payload;
                setLogs((current) => [log, ...current]);
            }
        });
        return () => socket.close();
    }, []);
    const selectedCall = useMemo(() => calls.find((call) => call.id === selectedCallId), [calls, selectedCallId]);
    const pendingCalls = calls.filter((call) => call.actionstepLogStatus !== "logged");
    return (_jsxs("main", { className: "app-shell", children: [_jsxs("section", { className: "hero", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "3CX + Actionstep companion platform" }), _jsx("h1", { children: "Capture the call, then log it against the right matter." }), _jsx("p", { className: "hero-copy", children: "This shell is ready for your frontend polish. The backend is already tracking calls, pushing real-time updates, and accepting matter logs." })] }), _jsxs("div", { className: "hero-stats", children: [_jsxs("div", { className: "stat-card", children: [_jsx("span", { className: "label", children: "Pending logs" }), _jsx("strong", { children: pendingCalls.length })] }), _jsxs("div", { className: "stat-card", children: [_jsx("span", { className: "label", children: "Logged calls" }), _jsx("strong", { children: logs.length })] })] })] }), _jsxs("section", { className: "workspace", children: [_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "panel-header", children: [_jsx("h2", { children: "Active and recent calls" }), _jsxs("span", { children: [calls.length, " total"] })] }), _jsx("div", { className: "call-list", children: calls.length === 0 ? (_jsx("p", { className: "empty-state", children: "No calls yet. Use the simulator endpoint to create one." })) : (calls.map((call) => (_jsx(CallCard, { call: call, selected: call.id === selectedCallId, onSelect: setSelectedCallId }, call.id)))) })] }), _jsx(LogForm, { call: selectedCall, onSaved: async () => setCalls(await fetchCalls()) })] }), _jsxs("section", { className: "panel", children: [_jsx("div", { className: "panel-header", children: _jsx("h2", { children: "Recent matter logs" }) }), _jsx("div", { className: "log-table", children: logs.length === 0 ? (_jsx("p", { className: "empty-state", children: "No Actionstep logs have been created yet." })) : (logs.map((log) => (_jsxs("article", { className: "log-row", children: [_jsxs("div", { children: [_jsx("span", { className: "label", children: "Matter" }), _jsx("strong", { children: log.matterNumber })] }), _jsxs("div", { children: [_jsx("span", { className: "label", children: "Call" }), _jsxs("strong", { children: [log.from, " ", "->", " ", log.to] })] }), _jsxs("div", { children: [_jsx("span", { className: "label", children: "Record" }), _jsx("strong", { children: log.actionstepRecordId })] }), _jsx("p", { children: log.notes })] }, log.id)))) })] })] }));
}
