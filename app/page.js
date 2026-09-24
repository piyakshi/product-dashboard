import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function RootPage() {
  const token = cookies().get("pad_token")?.value;
  redirect(token ? "/products" : "/login");
}
