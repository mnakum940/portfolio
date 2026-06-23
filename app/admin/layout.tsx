"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactMessage } from "../../utils/db";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "meet123") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem("portfolio_messages");
      if (stored) {
        try {
          const msgs = JSON.parse(stored);
          const count = msgs.filter((m: ContactMessage) => m.status === "UNREAD").length;
          setUnreadCount(count);
        } catch {}
      }
    };
    updateCount();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "portfolio_messages") {
        updateCount();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("messages_updated", updateCount);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("messages_updated", updateCount);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "meet123") {
      localStorage.setItem("admin_auth", "meet123");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const menuItems = [
    { name: "Overview", href: "/admin", icon: "dashboard" },
    { name: "Projects", href: "/admin/projects", icon: "folder_special" },
    { name: "Publications", href: "/admin/publications", icon: "article" },
    { name: "Skills", href: "/admin/skills", icon: "psychology" },
    { name: "Experience", href: "/admin/experience", icon: "work" },
    { name: "Testimonials", href: "/admin/testimonials", icon: "format_quote" },
    { name: "Inbox", href: "/admin/messages", icon: "mail" },
    { name: "Settings", href: "/admin/settings", icon: "settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md glass-card rounded-[32px] p-8 md:p-10 space-y-8 relative z-10 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">
              Meet Nakum
            </h1>
            <p className="text-[11px] tracking-[0.2em] font-semibold text-primary uppercase">
              Admin Console Authorization
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                ENTER SECURITY ACCESS CODE
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-outline-variant">
                  lock
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  className={`w-full bg-surface-container-lowest border ${
                    error ? "border-error focus:border-error" : "border-white/10 focus:border-primary"
                  } rounded-xl pl-12 pr-4 py-3 outline-none transition-all focus:ring-1 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant font-body`}
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="text-error text-xs ml-1 font-semibold animate-pulse">
                  Invalid security code. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl active:scale-[0.98] transition-all hover:shadow-[0_0_20px_rgba(163,201,255,0.4)] cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>

          <div className="text-center opacity-30 text-[9px] tracking-widest font-semibold uppercase">
            System Security Active
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#07090D] text-on-surface">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-surface-container-lowest border-r border-white/5 flex flex-col h-full z-20 shrink-0">
        <div className="p-8">
          <Link href="/">
            <h1 className="font-display text-[18px] font-bold tracking-tighter text-on-surface hover:text-primary transition-colors cursor-pointer">
              MEET NAKUM
            </h1>
          </Link>
          <p className="text-[10px] font-semibold tracking-widest text-primary uppercase mt-1">
            ADMIN CONSOLE V2.4
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-primary-container/10 text-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.name === "Inbox" && unreadCount > 0 && (
                  <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_0_10px_rgba(255,180,171,0.4)] animate-pulse shrink-0">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 mt-auto">
          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                MN
              </div>
              <div>
                <p className="text-xs font-bold">Meet Nakum</p>
                <p className="text-[10px] text-on-surface-variant">
                  System Administrator
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem("admin_auth");
              setIsAuthenticated(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/5 transition-all text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto bg-[#07090D] relative flex flex-col">
        {/* Atmosphere/Kinetic Background Effects */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* Top App Bar */}
        <header className="sticky top-0 w-full h-[72px] bg-surface-container-lowest/60 backdrop-blur-xl flex justify-between items-center px-10 border-b border-white/5 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-[18px] font-bold text-on-surface">
              {menuItems.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h2>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] tracking-wider uppercase font-semibold">
              Live
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                className="bg-surface-container-highest/40 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 w-64 transition-all text-on-surface"
                placeholder="Quick search..."
                type="text"
              />
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-on-surface">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <a
              href="/Meet_Nakum_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-on-primary font-bold text-[11px] tracking-[0.1em] px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(163,201,255,0.3)] transition-all active:scale-95 text-center"
            >
              RESUME PDF
            </a>
          </div>
        </header>

        {/* Content child page */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
