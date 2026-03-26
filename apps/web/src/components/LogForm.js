import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { logCall } from "../lib/api";
export function LogForm({ call, onSaved }) {
    const [matterNumber, setMatterNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        setMatterNumber(call?.actionstepMatterNumber ?? "");
        setNotes(call?.notes ?? "");
        setError(null);
    }, [call]);
    if (!call) {
        return (_jsxs("section", { className: "panel panel--detail", children: [_jsx("h2", { children: "Call details" }), _jsx("p", { children: "Select a call to start logging it against a matter." })] }));
    }
    const activeCall = call;
    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await logCall(activeCall.id, { matterNumber, notes });
            onSaved();
        }
        catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Unable to save call log");
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsxs("section", { className: "panel panel--detail", children: [_jsx("h2", { children: "Log call" }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { children: [_jsx("span", { className: "label", children: "Caller" }), _jsx("strong", { children: call.contactName ?? call.from })] }), _jsxs("div", { children: [_jsx("span", { className: "label", children: "Direction" }), _jsx("strong", { children: call.direction })] }), _jsxs("div", { children: [_jsx("span", { className: "label", children: "From" }), _jsx("strong", { children: call.from })] }), _jsxs("div", { children: [_jsx("span", { className: "label", children: "To" }), _jsx("strong", { children: call.to })] })] }), _jsxs("form", { className: "log-form", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { className: "label", children: "Matter number" }), _jsx("input", { value: matterNumber, onChange: (event) => setMatterNumber(event.target.value), placeholder: "AS-12345", required: true })] }), _jsxs("label", { children: [_jsx("span", { className: "label", children: "Notes" }), _jsx("textarea", { value: notes, onChange: (event) => setNotes(event.target.value), placeholder: "Call summary, follow-up, next step...", rows: 7, required: true })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { className: "primary-button", type: "submit", disabled: saving, children: saving ? "Saving..." : "Log against matter" })] })] }));
}
