"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredPublications, setStoredPublications, Publication, DEFAULT_PUBLICATIONS, formatExternalLink } from "../../../utils/db";

export default function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>(DEFAULT_PUBLICATIONS);

  useEffect(() => {
    setPublications(getStoredPublications());

    const handleSync = (e: StorageEvent) => {
      if (e.key === "portfolio_publications") {
        setPublications(getStoredPublications());
      }
    };
    const handleCustom = () => {
      setPublications(getStoredPublications());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("publications_updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("publications_updated", handleCustom);
    };
  }, []);

  const savePublications = (updatedPubs: Publication[]) => {
    setPublications(updatedPubs);
    setStoredPublications(updatedPubs);
    window.dispatchEvent(new Event("publications_updated"));
  };

  const [editingPubId, setEditingPubId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    year: new Date().getFullYear().toString(),
    abstract: "",
    link: "",
    tagsStr: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });

  const handleEditClick = (pub: Publication) => {
    setEditingPubId(pub.id);
    setFormData({
      title: pub.title,
      venue: pub.venue,
      year: pub.year.toString(),
      abstract: pub.abstract,
      link: pub.link === "#" ? "" : pub.link,
      tagsStr: pub.tags.join(", "),
      status: pub.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingPubId(null);
    setFormData({
      title: "",
      venue: "",
      year: new Date().getFullYear().toString(),
      abstract: "",
      link: "",
      tagsStr: "",
      status: "PUBLISHED",
    });
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingPubId) {
      savePublications(
        publications.map((p) =>
          p.id === editingPubId
            ? {
                ...p,
                title: formData.title,
                venue: formData.venue || "Self Published",
                year: parseInt(formData.year) || new Date().getFullYear(),
                abstract: formData.abstract,
                link: formData.link || "#",
                tags: formData.tagsStr
                  .split(",")
                  .map((s) => s.trim().toUpperCase())
                  .filter(Boolean),
                status: formData.status,
                lastEdited: formData.status === "DRAFT" ? "Last edited just now" : undefined,
              }
            : p
        )
      );
      setEditingPubId(null);
    } else {
      const newPub: Publication = {
        id: Date.now().toString(),
        title: formData.title,
        venue: formData.venue || "Self Published",
        year: parseInt(formData.year) || new Date().getFullYear(),
        abstract: formData.abstract,
        link: formData.link || "#",
        tags: formData.tagsStr.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
        status: formData.status,
        views: formData.status === "PUBLISHED" ? "0 views" : undefined,
        lastEdited: formData.status === "DRAFT" ? "Last edited just now" : undefined,
      };
      savePublications([newPub, ...publications]);
    }

    setFormData({
      title: "",
      venue: "",
      year: new Date().getFullYear().toString(),
      abstract: "",
      link: "",
      tagsStr: "",
      status: "PUBLISHED",
    });
  };

  const handleDelete = (id: string) => {
    if (editingPubId === id) {
      handleCancelEdit();
    }
    savePublications(publications.filter((p) => p.id !== id));
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(publications, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `meet_nakum_publications_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 relative z-10">
      <header className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[32px] md:text-[48px] font-semibold text-on-surface mb-4">
              Research Publications Management
            </h1>
            <p className="text-on-surface-variant font-body text-[16px] max-w-2xl leading-relaxed">
              Interface for archiving academic breakthroughs. Maintain a precise record of publications, venues, and ongoing intelligence development.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 glass-card px-6 py-3 rounded-xl font-bold text-[12px] tracking-[0.1em] hover:bg-white/10 transition-all uppercase cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              EXPORT DATA
            </button>
          </div>
        </div>
      </header>

      {/* Bento Layout: Form and List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Research Entry Form */}
        <aside className="lg:col-span-5 space-y-8">
          <section className="glass-card p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent pointer-events-none" />
            <h2 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                {editingPubId ? "edit_note" : "add_notes"}
              </span>
              {editingPubId ? "Edit Publication" : "Add New Publication"}
            </h2>
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                  PAPER TITLE
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body"
                  placeholder="Towards Autonomous Neural Architectures"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                    VENUE
                  </label>
                  <input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body"
                    placeholder="NeurIPS 2024"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                    YEAR
                  </label>
                  <input
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body"
                    placeholder="2024"
                    type="number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                  ABSTRACT
                </label>
                <textarea
                  required
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body resize-none"
                  placeholder="Brief summary of research objectives and results..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                    DOI / LINK
                  </label>
                  <input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body"
                    placeholder="https://doi.org/..."
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                    TAGS
                  </label>
                  <input
                    value={formData.tagsStr}
                    onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body"
                    placeholder="LLM, Agentic AI"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant ml-1 uppercase">
                  STATUS
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "PUBLISHED" | "DRAFT" })
                  }
                  className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body cursor-pointer"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                {editingPubId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 border border-white/10 text-on-surface font-bold py-4 rounded-xl active:scale-95 transition-all hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary font-bold py-4 rounded-xl active:scale-95 transition-all hover:shadow-[0_0_30px_rgba(163,201,255,0.2)] cursor-pointer"
                >
                  {editingPubId ? "Save Changes" : "Publish Entry"}
                </button>
              </div>
            </form>
          </section>

          <div className="glass-card p-6 rounded-2xl flex items-center justify-between group cursor-pointer overflow-hidden shadow-lg">
            <div className="relative z-10">
              <div className="text-[10px] tracking-[0.1em] font-semibold text-primary mb-1 uppercase">
                TOTAL IMPACT
              </div>
              <div className="text-3xl font-display font-bold">142 Citations</div>
            </div>
            <span className="material-symbols-outlined text-4xl opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-500 transform group-hover:scale-110">
              trending_up
            </span>
          </div>
        </aside>

        {/* Research List */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-xl font-bold">Recent Publications</h2>
            <div className="flex gap-3 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline-variant">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-container-lowest border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body w-full sm:w-48"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
                className="bg-surface-container-lowest border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/40 transition-colors text-on-surface font-body cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Publication Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {publications
                .filter((pub) => {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch =
                    pub.title.toLowerCase().includes(query) ||
                    pub.venue.toLowerCase().includes(query) ||
                    pub.abstract.toLowerCase().includes(query) ||
                    pub.tags.some((t) => t.toLowerCase().includes(query));
                  const matchesStatus =
                    statusFilter === "ALL" || pub.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((pub) => (
                  <motion.article
                    key={pub.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`glass-card p-6 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 border-l-4 group flex flex-col justify-between min-h-[220px] ${
                      pub.status === "PUBLISHED"
                        ? "border-l-primary/40"
                        : "border-l-tertiary/40"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-0.5 rounded-full font-bold text-[9px] tracking-wider border uppercase ${
                              pub.status === "PUBLISHED"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-tertiary/10 text-tertiary border-tertiary/20"
                            }`}
                          >
                            {pub.status}
                          </span>
                          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">
                            {pub.venue}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(pub)}
                            className="p-1 hover:text-primary cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(pub.id)}
                            className="p-1 hover:text-error cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                        {pub.title}
                      </h3>
                      
                      <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 leading-relaxed font-body">
                        {pub.abstract}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pub.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-surface-container-highest px-3 py-1 rounded text-[9px] font-bold tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            calendar_today
                          </span>{" "}
                          {pub.year}
                        </span>
                        {pub.views && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              visibility
                            </span>{" "}
                            {pub.views}
                          </span>
                        )}
                        {pub.lastEdited && (
                          <span className="flex items-center gap-1 text-tertiary">
                            <span className="material-symbols-outlined text-[14px]">
                              history
                            </span>{" "}
                            {pub.lastEdited}
                          </span>
                        )}
                      </div>
                      {pub.link && (
                        <a
                          className="text-primary font-bold text-xs flex items-center gap-1 hover:underline"
                          href={formatExternalLink(pub.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {pub.link.startsWith("http") ? "LINK" : "DOI"}{" "}
                          <span className="material-symbols-outlined text-[14px]">
                            north_east
                          </span>
                        </a>
                      )}
                    </div>
                  </motion.article>
                ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
