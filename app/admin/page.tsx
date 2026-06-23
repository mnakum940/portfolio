"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getStoredProjects, getStoredPublications, getStoredExperiences, getStoredMessages, DEFAULT_PROJECTS, DEFAULT_PUBLICATIONS, ContactMessage } from "../../utils/db";

export default function AdminOverview() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [projectCount, setProjectCount] = useState(DEFAULT_PROJECTS.length);
  const [pubCount, setPubCount] = useState(DEFAULT_PUBLICATIONS.length);
  const [expCount, setExpCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);

  const loadData = () => {
    setProjectCount(getStoredProjects().length);
    setPubCount(getStoredPublications().length);
    setExpCount(getStoredExperiences().length);
    const msgs = getStoredMessages();
    setTotalMessages(msgs.length);
    setUnreadCount(msgs.filter((m) => m.status === "UNREAD").length);
    setRecentMessages(msgs.slice(0, 3));
  };

  useEffect(() => {
    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "portfolio_projects" ||
        e.key === "portfolio_publications" ||
        e.key === "portfolio_experiences" ||
        e.key === "portfolio_messages"
      ) {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("messages_updated", loadData);
    window.addEventListener("settings_updated", loadData);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("messages_updated", loadData);
      window.removeEventListener("settings_updated", loadData);
    };
  }, []);

  const handleBackup = () => {
    if (backupStatus) return;
    setBackupStatus("RUNNING");
    setTimeout(() => {
      setBackupStatus("COMPLETED");
      setTimeout(() => {
        setBackupStatus(null);
      }, 3000);
    }, 2000);
  };

  // Micro-interactions for stat cards
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".stat-card");
    if (!cards) return;

    const handleMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const glow = card.querySelector(".glow-effect") as HTMLElement;
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(163, 201, 255, 0.15) 0%, transparent 70%)`;
      }
    };

    const activeListeners: Array<{ card: HTMLElement; handler: (e: MouseEvent) => void }> = [];

    cards.forEach((el) => {
      const card = el as HTMLElement;
      const handler = (e: MouseEvent) => handleMouseMove(e, card);
      card.addEventListener("mousemove", handler);
      activeListeners.push({ card, handler });
    });

    return () => {
      activeListeners.forEach(({ card, handler }) => {
        card.removeEventListener("mousemove", handler);
      });
    };
  }, []);

  const stats = [
    { title: "Total Projects", value: projectCount.toString(), icon: "folder_special", change: "Portfolio active", color: "bg-primary/10 text-primary" },
    { title: "Publications", value: pubCount.toString(), icon: "article", change: "Academic index", color: "bg-secondary/10 text-secondary" },
    { title: "Unread Mail", value: unreadCount.toString(), icon: "mail", change: `${totalMessages} total inquiries`, color: "bg-tertiary/10 text-tertiary", changeColor: unreadCount > 0 ? "text-error" : "text-on-surface-variant" },
  ];

  return (
    <div ref={containerRef} className="p-10 max-w-7xl mx-auto space-y-10 relative z-10">
      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="glass-card rounded-[2rem] p-8 relative overflow-hidden group stat-card cursor-default shadow-lg"
          >
            {/* Glow sweep layer */}
            <div className="glow-effect absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <span className={`${stat.changeColor || "text-primary"} font-bold text-[10px] tracking-wider uppercase`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-on-surface-variant text-xs tracking-widest uppercase font-semibold">
                {stat.title}
              </h3>
              <p className="text-5xl font-display font-bold mt-2">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed / Recent Transmissions */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-on-surface">Recent Transmissions</h3>
            <Link href="/admin/messages" className="text-xs text-primary font-bold tracking-wider border-b border-primary/30 hover:border-primary transition-all pb-0.5 uppercase cursor-pointer">
              OPEN INBOX
            </Link>
          </div>
          
          <div className="glass-card rounded-[2rem] overflow-hidden">
            <div className="divide-y divide-white/5">
              {recentMessages.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant text-sm flex flex-col items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-4xl opacity-20">mail_outline</span>
                  No inquiries received yet.
                </div>
              ) : (
                recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    className="p-6 flex gap-6 hover:bg-white/[0.02] transition-colors group cursor-pointer block text-left"
                  >
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                      <span className={`material-symbols-outlined ${
                        msg.status === "UNREAD" ? "text-primary" : "text-on-surface-variant"
                      } text-xl`}>
                        {msg.status === "UNREAD" ? "mail" : "drafts"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                          {msg.name}
                        </h4>
                        <span className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase shrink-0">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-primary/80 mt-1 uppercase tracking-wider truncate">
                        {msg.subject}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-2 leading-relaxed line-clamp-1">
                        {msg.message}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions & Insights Sidebar */}
        <aside className="space-y-8">
          <div>
            <h3 className="text-xs tracking-widest text-on-surface-variant uppercase font-semibold mb-6">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/admin/projects" className="w-full glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">add_box</span>
                  <span className="text-sm font-medium">Add New Project</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-sm">
                  arrow_forward_ios
                </span>
              </Link>
              <button
                onClick={handleBackup}
                disabled={backupStatus === "RUNNING"}
                className={`w-full glass-card p-4 rounded-2xl flex items-center justify-between transition-all group text-left cursor-pointer ${
                  backupStatus === "RUNNING"
                    ? "opacity-60 cursor-not-allowed bg-white/5"
                    : backupStatus === "COMPLETED"
                    ? "bg-primary/10 border-primary/30"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${
                    backupStatus === "COMPLETED" ? "text-primary" : "text-secondary"
                  } ${backupStatus === "RUNNING" ? "animate-spin" : ""}`}>
                    {backupStatus === "RUNNING"
                      ? "sync"
                      : backupStatus === "COMPLETED"
                      ? "check_circle"
                      : "database"}
                  </span>
                  <span className="text-sm font-medium">
                    {backupStatus === "RUNNING"
                      ? "Running Backup..."
                      : backupStatus === "COMPLETED"
                      ? "Backup Completed!"
                      : "Database Backup"}
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-sm">
                  arrow_forward_ios
                </span>
              </button>
              <Link href="/admin/experience" className="w-full glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary">history_edu</span>
                  <span className="text-sm font-medium">Career Timeline Manager</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-sm">
                  arrow_forward_ios
                </span>
              </Link>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">System Status</h4>
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Database Size</span>
                  <span className="font-bold">{(JSON.stringify(getStoredProjects()).length + JSON.stringify(getStoredPublications()).length + JSON.stringify(getStoredExperiences()).length + JSON.stringify(getStoredMessages()).length + JSON.stringify(getStoredExperiences()).length).toString()} bytes</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "12%" }} />
                </div>
                
                <div className="flex justify-between items-center text-xs mt-6">
                  <span className="text-on-surface-variant">Indexed Items</span>
                  <span className="font-bold text-primary">{projectCount + pubCount + expCount}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center opacity-40 gap-4">
          <p className="text-[10px] tracking-[0.2em] font-semibold uppercase text-center md:text-left">
            © 2026 Meet Nakum — Precision in Intelligence
          </p>
          <div className="flex gap-8">
            <a className="text-[10px] tracking-[0.2em] font-semibold uppercase hover:text-primary transition-colors" href="#">
              GitHub
            </a>
            <a className="text-[10px] tracking-[0.2em] font-semibold uppercase hover:text-primary transition-colors" href="#">
              LinkedIn
            </a>
            <a className="text-[10px] tracking-[0.2em] font-semibold uppercase hover:text-primary transition-colors" href="#">
              System Logs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
