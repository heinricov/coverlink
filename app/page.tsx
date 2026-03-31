"use client";
import { InputLink } from "@/components/input-link";

export default function Home() {
  return (
    <section className="min-h-screen bg-linear-to-b from-background to-muted/50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-6 px-4 py-10 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            COVERLINK
          </h1>

          <p className="text-sm text-muted-foreground sm:text-base">
            Buat kombinasi tautan otomatis lalu buka atau kelola semuanya
            sekaligus..
          </p>
        </div>
        <div className="w-full">
          <InputLink />
        </div>
      </div>
    </section>
  );
}
