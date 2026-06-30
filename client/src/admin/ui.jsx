// Small shared building blocks for the admin views.

export function PageHead({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="font-display font-extrabold text-2xl tracking-tight">
        {title}
      </h1>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white/5 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value, accent = "#7866FF" }) {
  return (
    <Card className="p-5">
      <div className="text-bone/45 text-xs uppercase tracking-[0.18em]">
        {label}
      </div>
      <div
        className="font-display font-extrabold mt-2"
        style={{ fontSize: "2rem", color: accent }}
      >
        {value}
      </div>
    </Card>
  );
}

export function Btn({ children, variant = "solid", className = "", ...props }) {
  const styles =
    variant === "ghost"
      ? "border border-line text-bone/70 hover:text-bone hover:bg-white/5"
      : variant === "danger"
      ? "bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25"
      : "bg-violet text-ink hover:scale-[1.02]";
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full bg-white/5 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-violet text-bone ${
        props.className || ""
      }`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full bg-white/5 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-violet text-bone resize-none ${
        props.className || ""
      }`}
    />
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.16em] text-bone/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

// Reusable image picker: shows a preview, an upload button, and a remove
// button. `value` is { url, public_id } | null. `onUpload(file)` and
// `onRemove()` are async callbacks the caller wires to the API.
import { useRef, useState } from "react";

export function ImageUpload({ value, onUpload, onRemove, label = "Image" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="block text-xs uppercase tracking-[0.16em] text-bone/45 mb-1.5">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-lg border border-line bg-white/5 overflow-hidden grid place-items-center shrink-0">
          {value?.url ? (
            <img src={value.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-bone/30 text-xs">none</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handle}
          className="hidden"
        />
        <Btn variant="ghost" type="button" onClick={pick} disabled={busy}>
          {busy ? "Uploading…" : value?.url ? "Replace" : "Upload"}
        </Btn>
        {value?.url && onRemove && (
          <Btn variant="danger" type="button" onClick={onRemove}>
            Remove
          </Btn>
        )}
      </div>
    </div>
  );
}
