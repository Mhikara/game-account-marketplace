import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Game Account Marketplace</h1>
      <p className="text-zinc-400 text-sm">Fase 1–2: setup + auth</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold">
          Login
        </Link>
        <Link href="/register" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">
          Daftar
        </Link>
      </div>
    </main>
  );
}
