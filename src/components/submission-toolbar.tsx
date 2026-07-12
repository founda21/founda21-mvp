"use client";

import { useRef, useState } from "react";

const toolbarButtonClass =
  "rounded-full border border-emerald text-emerald px-4 py-2 text-xs font-semibold whitespace-nowrap hover:bg-emerald hover:text-white transition-colors";

export function SubmissionToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        name="artifactFile"
        accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx,.xls,.csv,image/*"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <button type="button" onClick={() => fileInputRef.current?.click()} className={toolbarButtonClass}>
        📎 {fileName ?? "Upload file"}
      </button>

      {showLinkInput ? (
        <input
          type="url"
          name="linkUrl"
          value={linkValue}
          onChange={(e) => setLinkValue(e.target.value)}
          placeholder="https://… (deck, recording, data room, etc.)"
          autoFocus
          className="rounded-full border border-navy/20 px-4 py-2 text-xs text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-emerald w-64"
        />
      ) : (
        <button type="button" onClick={() => setShowLinkInput(true)} className={toolbarButtonClass}>
          🔗 Add a link
        </button>
      )}
    </div>
  );
}
