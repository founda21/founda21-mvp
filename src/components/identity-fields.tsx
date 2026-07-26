import { Field, Input } from "@/components/ui";

// Phone number is the anti-duplicate-account signal for now (unique at the
// DB level, § src/lib/actions/founder.ts createFounderInCohort). SA ID/
// passport collection was removed to avoid asking for sensitive government
// ID before it's genuinely needed — a stronger identity check (§ identity.ts,
// kept in place but unused) can be reintroduced later once that's designed
// properly, rather than bolted on at signup.
export function IdentityFields() {
  return (
    <Field label="Phone number">
      <Input name="phoneNumber" type="tel" required placeholder="082 123 4567" autoComplete="off" />
      <p className="text-navy/50 text-xs font-normal mt-1">
        Used to keep one account per person, no marketing messages.
      </p>
    </Field>
  );
}
