import Link from "next/link";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#07090D] text-on-surface overflow-x-hidden selection:bg-primary/30 selection:text-white">
      <HomeClient />

      {/* Tiny Hidden Admin Trigger */}
      <div className="fixed bottom-4 right-4 z-[100]">
        <Link 
          href="/admin" 
          className="opacity-0 hover:opacity-20 transition-opacity w-4 h-4 bg-white/10 rounded-full cursor-default block"
          aria-label="Admin Portal"
        />
      </div>
    </main>
  );
}
