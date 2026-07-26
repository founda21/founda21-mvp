"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Theme = "light" | "dark";

const THEME_COOKIE = "founda21_theme";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return store.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
}

export async function updateTheme(formData: FormData) {
  const theme = formData.get("theme") === "dark" ? "dark" : "light";
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  redirect("/dashboard/settings");
}
