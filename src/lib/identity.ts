import { createHash } from "crypto";

// System integrity fix 1 — identity anchor. Validates and normalizes
// identity fields at signup; the raw ID/passport number is only ever held
// in memory here (validated, hashed, discarded) and must never be
// persisted, logged, or returned from any action.

function luhnCheckDigit(digits12: string): number {
  let oddSum = 0;
  let evenDigits = "";
  for (let i = 0; i < 12; i++) {
    const pos = i + 1; // 1-indexed
    if (pos % 2 === 1) {
      oddSum += Number(digits12[i]);
    } else {
      evenDigits += digits12[i];
    }
  }
  const evenDoubled = String(Number(evenDigits) * 2);
  const evenSum = evenDoubled.split("").reduce((sum, d) => sum + Number(d), 0);
  const total = oddSum + evenSum;
  return (10 - (total % 10)) % 10;
}

function isValidSaIdDate(yy: string, mm: string, dd: string): boolean {
  const month = Number(mm);
  const day = Number(dd);
  if (month < 1 || month > 12) return false;
  // A 2-digit year is ambiguous between centuries — accept if either
  // interpretation forms a real calendar date.
  for (const century of [19, 20]) {
    const year = century * 100 + Number(yy);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return true;
    }
  }
  return false;
}

export function validateSaId(idNumber: string): { ok: true } | { ok: false; error: string } {
  if (!/^\d{13}$/.test(idNumber)) {
    return { ok: false, error: "SA ID number must be exactly 13 digits." };
  }
  const yy = idNumber.slice(0, 2);
  const mm = idNumber.slice(2, 4);
  const dd = idNumber.slice(4, 6);
  if (!isValidSaIdDate(yy, mm, dd)) {
    return { ok: false, error: "That SA ID number's date-of-birth segment isn't a valid date." };
  }
  const expectedCheckDigit = luhnCheckDigit(idNumber.slice(0, 12));
  if (expectedCheckDigit !== Number(idNumber[12])) {
    return { ok: false, error: "That SA ID number failed the checksum validation, check it and try again." };
  }
  return { ok: true };
}

// No universal passport format exists — light sanity check only (real
// verification would need a document/OCR check, out of scope here).
export function validatePassport(passportNumber: string): { ok: true } | { ok: false; error: string } {
  const trimmed = passportNumber.trim();
  if (trimmed.length < 5 || trimmed.length > 20 || !/^[A-Za-z0-9]+$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid passport number (letters and numbers only)." };
  }
  return { ok: true };
}

export function validateIdNumber(
  idType: "sa_id" | "passport",
  idNumber: string,
): { ok: true } | { ok: false; error: string } {
  return idType === "sa_id" ? validateSaId(idNumber) : validatePassport(idNumber);
}

// Accepts local SA format (0821234567), already-international (+27821234567
// or 27821234567), and normalizes to E.164. Not a full libphonenumber-grade
// validator — a pragmatic format check, not carrier verification.
export function normalizePhoneToE164(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const cleaned = raw.replace(/[^\d+]/g, "");
  let normalized: string;
  if (cleaned.startsWith("+")) {
    normalized = cleaned;
  } else if (cleaned.startsWith("0")) {
    normalized = `+27${cleaned.slice(1)}`;
  } else if (cleaned.startsWith("27")) {
    normalized = `+${cleaned}`;
  } else {
    normalized = `+${cleaned}`;
  }
  if (!/^\+\d{8,15}$/.test(normalized)) {
    return { ok: false, error: "Enter a valid phone number, e.g. 082 123 4567 or +27 82 123 4567." };
  }
  return { ok: true, value: normalized };
}

// SHA-256(idNumber + pepper) — the pepper is an app-level secret (never
// stored alongside the hash) so the hash alone can't be reversed via a
// precomputed table of every possible 13-digit SA ID even if the DB leaks.
export function hashIdNumber(idNumber: string): string {
  const pepper = process.env.ID_HASH_PEPPER;
  if (!pepper) throw new Error("ID_HASH_PEPPER is not configured.");
  return createHash("sha256").update(`${idNumber}:${pepper}`).digest("hex");
}
