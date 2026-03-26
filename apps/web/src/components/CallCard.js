import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CallCard({ call, selected, onSelect }) {
    return (_jsxs("button", { className: `call-card ${selected ? "selected" : ""}`, onClick: () => onSelect(call.id), type: "button", children: [_jsxs("div", { className: "call-card__top", children: [_jsx("span", { className: `badge badge--${call.direction}`, children: call.direction }), _jsx("span", { className: `badge badge--status-${call.status}`, children: call.status })] }), _jsx("strong", { children: call.contactName ?? call.from }), _jsxs("span", { children: [call.from, " ", "->", " ", call.to] }), _jsxs("span", { children: ["Ext ", call.agentExtension] }), _jsx("span", { children: call.actionstepLogStatus === "logged"
                    ? `Logged to ${call.actionstepMatterNumber}`
                    : "Needs matter logging" })] }));
}
