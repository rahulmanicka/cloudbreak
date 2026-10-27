import Link from "next/link";
import { Breaky } from "@/components/BreakyAvatar";
import { AuthForm } from "../AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <Breaky size={118} pose="wave" />
        <h1 className="mt-2 text-3xl font-black">Let&apos;s start</h1>
        <p className="text-ink-soft">Just a username. Nobody here needs your real name.</p>
      </div>
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-sm font-bold text-ink-soft">
        Have an account?{" "}
        <Link href="/login" className="text-sky-dark">
          Log in
        </Link>
      </p>
    </main>
  );
}
