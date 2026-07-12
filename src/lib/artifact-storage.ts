import { createAdminClient } from "@/lib/supabase/admin";
import { extensionFor } from "@/lib/file-extract";

const BUCKET = "artifacts";

export async function uploadArtifactFile(
  founderId: string,
  checkpointId: number,
  attemptNumber: number,
  file: File,
): Promise<string> {
  const admin = createAdminClient();
  const path = `${founderId}/checkpoint-${checkpointId}/attempt-${attemptNumber}${extensionFor(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload artifact file: ${error.message}`);

  return path;
}

// Files live in a private bucket (founders' legal docs, financial models,
// etc.) — institution admins need a time-boxed signed URL to view them,
// never a public link.
export async function getSignedArtifactUrl(storagePath: string, expiresInSeconds = 300): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}
