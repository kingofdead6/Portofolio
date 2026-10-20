/* HUD-style section label: index, a scanning signal line and the name. */
export default function SectionTag({ num, label, align = "start", className = "" }) {
  const justify =
    align === "end" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <div
      className={`flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-bone/55 ${justify} ${className}`}
    >
      <span className="orbit-ico" aria-hidden />
      <span className="font-display font-bold text-violet tabular-nums">{num}</span>
      <span className="signal-line" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
