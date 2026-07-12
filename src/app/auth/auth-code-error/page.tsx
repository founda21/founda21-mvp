import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-sm flex flex-col gap-4 text-center">
        <h1 className="text-navy text-2xl font-bold">That link didn&apos;t work</h1>
        <p className="text-navy/60 text-sm">
          This link may have expired or already been used. Request a new one and try again.
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/forgot-password" className="text-emerald font-semibold text-sm">
            Reset password
          </Link>
          <Link href="/login" className="text-emerald font-semibold text-sm">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
