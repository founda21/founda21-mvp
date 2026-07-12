export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className ?? ""}`}>
      <span className="text-navy">Fo</span>
      <span className="text-emerald">u</span>
      <span className="text-navy">nda</span>
      <span className="text-emerald">21</span>
    </span>
  );
}
