import Link from "next/link";
import { Breaky } from "@/components/BreakyAvatar";
import { AuthForm } from "../AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <Breaky size={118} pose="wave" />
        <h1 className="mt-2 text-3xl font-black">Welcome back</h1>
      </div>
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm font-bold text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="text-sky-dark">
          Create an account
        </Link>
      </p>
    </main>
  );
}
