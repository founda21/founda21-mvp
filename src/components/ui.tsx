import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  ...props
}: { label: string } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-navy" {...props}>
      <span className="font-semibold">{label}</span>
      {props.children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-lg border border-navy/20 bg-surface px-3 py-2 text-navy placeholder:text-navy/60 focus:outline-none focus:ring-2 focus:ring-emerald ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-lg border border-navy/20 bg-surface px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-emerald ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`rounded-lg border border-navy/20 bg-surface px-3 py-2 text-navy placeholder:text-navy/60 focus:outline-none focus:ring-2 focus:ring-emerald ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-emerald text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full border border-navy text-navy px-6 py-2.5 text-sm font-semibold hover:bg-brand hover:text-white transition-colors disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
      {message}
    </div>
  );
}

export function InfoBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-emerald/30 bg-emerald/5 text-navy text-sm px-4 py-3">
      {message}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClasses = {
    neutral: "bg-navy/10 text-navy",
    success: "bg-emerald/15 text-emerald",
    warning: "bg-amber-100 text-amber-700",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses}`}>
      {children}
    </span>
  );
}
