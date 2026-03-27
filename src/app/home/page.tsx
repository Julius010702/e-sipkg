// src/app/home/page.tsx
// Redirect ke root landing page

import { redirect } from "next/navigation";

export default function HomeRedirect() {
  redirect("/");
}