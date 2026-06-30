const NBSP = String.fromCharCode(160); // non-breaking space

/* Splits text into per-character spans for staggered char animations. */
export default function Split({ text, cls = "" }) {
  return [...text].map((c, i) => (
    <span key={i} className={"char " + cls}>
      {c === " " ? NBSP : c}
    </span>
  ));
}
