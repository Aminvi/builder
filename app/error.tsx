"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("BuildPro application error:", error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-[#050b14] px-4 text-white"><div className="w-full max-w-lg rounded-2xl border border-[#17283a] bg-[#091320] p-7 text-center shadow-2xl"><div className="text-xs font-bold tracking-[.2em] text-[#7f92a8]">BUILDPRO</div><h1 className="mt-3 text-2xl font-bold">Something went wrong</h1><p className="mt-2 text-sm text-[#8191a6]">The application hit an unexpected error. Your saved database records are not deleted by this screen.</p><button type="button" onClick={() => reset()} className="mt-6 rounded bg-[#1769e0] px-5 py-2.5 text-xs font-bold">Try again</button><a href="/login" className="ml-2 inline-block rounded border border-[#26394d] px-5 py-2.5 text-xs font-bold">Go to sign in</a></div></main>;
}
