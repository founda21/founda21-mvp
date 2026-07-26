"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export function ProfileMenu({ institutionName }: { institutionName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-navy/15 pl-3 pr-2.5 py-1.5 text-sm font-semibold text-navy hover:bg-navy/5 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white text-xs font-bold shrink-0">
          {institutionName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[10rem] truncate">{institutionName}</span>
        <span className="text-navy/40 text-xs">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-navy/10 bg-surface shadow-[0_16px_40px_rgba(10,31,68,0.16)] py-1.5 z-30"
        >
          <Link
            href="/dashboard/settings"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/dashboard/contracts"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors"
            onClick={() => setOpen(false)}
          >
            Contracts
          </Link>
          <Link
            href="/dashboard/help"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors"
            onClick={() => setOpen(false)}
          >
            Help
          </Link>
          <div className="my-1.5 border-t border-navy/10" />
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
