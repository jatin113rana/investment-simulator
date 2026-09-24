import { redirect } from "next/navigation";

export default function AdminRouteRedirect() {
  redirect("/dashboard");
}
