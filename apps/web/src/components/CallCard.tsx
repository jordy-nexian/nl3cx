import type { CallSession } from "../lib/types";

interface CallCardProps {
  call: CallSession;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function CallCard({ call, selected, onSelect }: CallCardProps) {
  return (
    <button
      className={`call-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(call.id)}
      type="button"
    >
      <div className="call-card__top">
        <span className={`badge badge--${call.direction}`}>{call.direction}</span>
        <span className={`badge badge--status-${call.status}`}>{call.status}</span>
      </div>
      <strong>{call.contactName ?? call.from}</strong>
      <span>{call.from} {"->"} {call.to}</span>
      <span>Ext {call.agentExtension}</span>
      <span>
        {call.actionstepLogStatus === "logged"
          ? `Logged to ${call.actionstepMatterNumber}`
          : "Needs matter logging"}
      </span>
    </button>
  );
}
