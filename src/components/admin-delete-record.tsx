import { ErrorBanner, Field, Input } from "@/components/ui";

export function AdminDeleteRecord({
  title,
  description,
  action,
  hiddenFields,
  error,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void;
  hiddenFields: Record<string, string>;
  error?: string;
}) {
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-5 flex flex-col gap-4">
      <div>
        <p className="text-red-700 font-bold text-sm">{title}</p>
        <p className="text-navy/70 text-sm mt-1">{description}</p>
      </div>

      <ErrorBanner message={error} />

      <form action={action} className="flex flex-col gap-4">
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <Field label='Type "DELETE" to confirm'>
          <Input name="confirmText" type="text" required placeholder="DELETE" />
        </Field>
        <button
          type="submit"
          className="rounded-full bg-red-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors self-start"
        >
          {title}
        </button>
      </form>
    </div>
  );
}
