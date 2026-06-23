"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredProjects, setStoredProjects, Project, DEFAULT_PROJECTS } from "../../../utils/db";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    setProjects(getStoredProjects());

    const handleSync = (e: StorageEvent) => {
      if (e.key === "portfolio_projects") {
        setProjects(getStoredProjects());
      }
    };
    const handleCustom = () => {
      setProjects(getStoredProjects());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("projects_updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("projects_updated", handleCustom);
    };
  }, []);

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    setStoredProjects(updatedProjects);
    window.dispatchEvent(new Event("projects_updated"));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    title: "",
    desc: "",
    tagsStr: "",
    status: "LIVE" as "LIVE" | "BETA" | "ARCHIVED",
    link: "",
  });

  const handleDelete = (id: string) => {
    saveProjects(projects.filter((p) => p.id !== id));
  };

  const handleEditClick = (proj: Project) => {
    setEditingProjectId(proj.id);
    setNewProject({
      title: proj.title,
      desc: proj.desc,
      tagsStr: proj.tags.join(", "),
      status: proj.status,
      link: proj.link === "#" ? "" : proj.link,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setNewProject({ title: "", desc: "", tagsStr: "", status: "LIVE", link: "" });
    setEditingProjectId(null);
    setIsModalOpen(false);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;

    if (editingProjectId) {
      saveProjects(
        projects.map((p) =>
          p.id === editingProjectId
            ? {
                ...p,
                title: newProject.title,
                desc: newProject.desc,
                tags: newProject.tagsStr
                  .split(",")
                  .map((s) => s.trim().toUpperCase())
                  .filter(Boolean),
                status: newProject.status,
                link: newProject.link || "#",
              }
            : p
        )
      );
    } else {
      const added: Project = {
        id: Date.now().toString(),
        title: newProject.title,
        desc: newProject.desc,
        tags: newProject.tagsStr.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbPDiyA86La8qKF94Alo4wpxLrYWgNO9lEgLZCQog9A5NsRlzjOt1-IEfk5RJDjAnyqVdErMz9idoYw10nQpFDewDsLBCui-S2zJTCo2S-ZHD8hdSfDZwH7-lLFVn3bd5pT5sVcAROqY5r7dfXxcx0RgKlFItICWEPzsNRKCx8eO2aw_R4hHXd6ESeqTbmKGyJQFGO6nK32-RZz1RU2UBBjBYWMoTbsJlIorUi-_uY1UiiHEnJ4plTnayiO9iS7RShcTNzYCywXaY", // fallback demo cover
        status: newProject.status,
        link: newProject.link || "#",
      };
      saveProjects([...projects, added]);
    }

    handleCloseModal();
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="font-[600] text-[12px] tracking-[0.2em] text-primary mb-4 block uppercase font-body">
            ADMIN DASHBOARD
          </span>
          <h1 className="font-display text-[32px] md:text-[48px] font-semibold text-on-surface leading-tight">
            Project Portfolio Management
          </h1>
        </div>
        <button
          onClick={() => {
            setNewProject({ title: "", desc: "", tagsStr: "", status: "LIVE", link: "" });
            setEditingProjectId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(163,201,255,0.2)] transition-all group cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Project
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((proj) => (
          <div key={proj.id} className="glass-card rounded-2xl overflow-hidden group shadow-lg">
            <div className="relative h-64 w-full overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${proj.imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60 pointer-events-none" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 glass-card rounded-full text-[10px] font-bold tracking-wider ${
                  proj.status === "LIVE" ? "text-primary" : "text-tertiary"
                }`}>
                  {proj.status}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-display text-2xl font-bold">{proj.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(proj)}
                    className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-2 glass-card rounded-lg hover:bg-error/10 transition-colors text-on-surface-variant hover:text-error cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-on-surface-variant mb-6 line-clamp-2 leading-relaxed">
                {proj.desc}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-surface-container-high rounded text-[10px] font-bold tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-4 transition-all w-fit"
                href={proj.link}
              >
                VIEW PROJECT LIVE{" "}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden relative flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-surface-container-low/40">
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  {editingProjectId ? "Edit Project" : "Add New Project"}
                </h2>
                <button
                  className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors cursor-pointer"
                  onClick={handleCloseModal}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddProject} className="p-8 overflow-y-auto space-y-8 flex-1">
                {/* Form Group: Title */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    PROJECT TITLE
                  </label>
                  <input
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="e.g., NEURAL ARCHITECT"
                    type="text"
                  />
                </div>

                {/* Form Group: Description */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    DESCRIPTION
                  </label>
                  <textarea
                    required
                    value={newProject.desc}
                    onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant resize-none"
                    placeholder="Briefly describe the project's core intelligence and technical foundation..."
                    rows={4}
                  />
                </div>

                {/* Form Group: Tags */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    FEATURES (COMMA SEPARATED)
                  </label>
                  <input
                    value={newProject.tagsStr}
                    onChange={(e) => setNewProject({ ...newProject, tagsStr: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="Real-time, Scalable, AI-driven..."
                    type="text"
                  />
                </div>

                {/* Form Group: Status */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    STATUS
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, status: e.target.value as "LIVE" | "BETA" | "ARCHIVED" })
                    }
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface"
                  >
                    <option value="LIVE">LIVE</option>
                    <option value="BETA">BETA</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                {/* Form Group: Live Link */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    LIVE DEPLOYMENT LINK
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-outline-variant">
                      link
                    </span>
                    <input
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                      placeholder="https://github.com/meetnakum/..."
                      type="url"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    className="px-6 py-3 font-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary/10 cursor-pointer"
                  >
                    {editingProjectId ? "Save Changes" : "Publish Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
