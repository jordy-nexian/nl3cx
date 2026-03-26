const API_URL = "http://localhost:4000";
export async function fetchCalls() {
    const response = await fetch(`${API_URL}/api/calls`);
    return (await response.json());
}
export async function fetchLogs() {
    const response = await fetch(`${API_URL}/api/logs`);
    return (await response.json());
}
export async function logCall(callId, payload) {
    const response = await fetch(`${API_URL}/api/calls/${callId}/log`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error("Failed to log call");
    }
    return response.json();
}
export function connectRealtime(onMessage) {
    const socket = new WebSocket("ws://localhost:4000/ws");
    socket.addEventListener("message", (event) => {
        onMessage(JSON.parse(event.data));
    });
    return socket;
}
