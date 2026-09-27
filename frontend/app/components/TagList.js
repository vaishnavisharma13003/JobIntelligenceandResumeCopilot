// Renders a list of strings as small "chip" tags.
// variant controls color: "default" | "missing" | "partial"
export default function TagList({ items, variant = "default", emptyText = "None found." }) {
  if (!items || items.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: 13 }}>{emptyText}</p>;
  }
  return (
    <div>
      {items.map((item, idx) => (
        <span key={idx} className={`tag ${variant !== "default" ? variant : ""}`}>
          {item}
        </span>
      ))}
    </div>
  );
}
