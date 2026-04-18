// Eyebrow label — per "The Clinical Sanctuary" design spec:
// All-caps, 0.75rem, +0.05em tracking, primary_fixed (#D1E4FF) bg, brand-primary text.
export default function Label({ children, className = "" }) {
  return (
    <span
      className={`inline-block text-[0.7rem] font-bold uppercase tracking-[0.08em] px-3 py-1 rounded ${className}`}
      style={{ backgroundColor: "#D1E4FF", color: "#003b72" }}
    >
      {children}
    </span>
  );
}
