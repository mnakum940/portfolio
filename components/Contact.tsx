"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { getStoredSettings, getStoredMessages, DEFAULT_SETTINGS, ProfileSettings, formatSocialLink } from "../utils/db";

export default function Contact() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Collaboration Inquiry",
    message: "",
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [isSpotlit, setIsSpotlit] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());

    const handleSync = () => {
      setSettings(getStoredSettings());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("settings_updated", handleSync);

    const handleSpotlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === "contact") {
        setIsSpotlit(true);
        setTimeout(() => setIsSpotlit(false), 3000);
      }
    };
    window.addEventListener("spotlight_section", handleSpotlight);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("settings_updated", handleSync);
      window.removeEventListener("spotlight_section", handleSpotlight);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toISOString(),
      status: "UNREAD" as const,
    };

    // Store locally first for immediate feedback
    const stored = getStoredMessages();
    stored.unshift(newMsg);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_messages", JSON.stringify(stored));
    }

    // Securely POST message to Supabase via the contact API route
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Contact database sync failed");
        }
      })
      .catch((err) => console.error("Contact sync error:", err));
    
    // Clear Form
    setFormData({
      name: "",
      email: "",
      subject: "Collaboration Inquiry",
      message: "",
    });

    // Notify admin
    window.dispatchEvent(new Event("messages_updated"));

    // Show Custom Toast
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      className={`py-[60px] lg:py-[120px] px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden relative z-10 transition-all duration-700 rounded-3xl ${
        isSpotlit ? "ring-2 ring-primary/60 bg-primary/5 shadow-[0_0_50px_rgba(163,201,255,0.3)] scale-[1.01]" : ""
      }`}
      id="contact"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="glass-card rounded-[32px] lg:rounded-[60px] p-6 md:p-12 lg:p-20 relative overflow-hidden shadow-2xl"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 relative z-10">
          {/* Info Side */}
          <div className="space-y-6 lg:space-y-8 flex flex-col justify-center text-left">
            <h2 className="font-display text-[28px] md:text-[48px] font-semibold leading-[1.2] letter-spacing-[-0.02em]">
              Ready to engineer the future?
            </h2>
            <p className="font-body text-[15px] md:text-[18px] text-on-surface-variant leading-[1.6]">
              Currently open to research collaborations and elite engineering opportunities.
            </p>
            
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 lg:gap-4 text-on-surface-variant hover:text-primary transition-colors text-sm lg:text-base">
                <span className="material-symbols-outlined text-primary text-xl">
                  mail
                </span>
                <span className="font-medium break-all">{settings.email}</span>
              </div>
              <div className="flex items-center gap-3 lg:gap-4 text-on-surface-variant hover:text-primary transition-colors text-sm lg:text-base">
                <span className="material-symbols-outlined text-primary text-xl">
                  location_on
                </span>
                <span className="font-medium" data-location={settings.location}>
                  {settings.location}
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              {settings.github !== "#" && (
                <a
                  className="w-10 h-10 lg:w-12 lg:h-12 glass-card rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-90"
                  href={formatSocialLink("github", settings.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <span className="material-symbols-outlined text-lg lg:text-xl">link</span>
                </a>
              )}
              {settings.linkedin !== "#" && (
                <a
                  className="w-10 h-10 lg:w-12 lg:h-12 glass-card rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-90"
                  href={formatSocialLink("linkedin", settings.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <span className="material-symbols-outlined text-lg lg:text-xl">
                    alternate_email
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Form Side */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                  Full Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-4 py-2.5 lg:py-3 focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/20 text-on-surface text-sm lg:text-base"
                  placeholder="John Doe"
                  type="text"
                />
              </div>
              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                  Email Address
                </label>
                <input
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-4 py-2.5 lg:py-3 focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/20 text-on-surface text-sm lg:text-base"
                  placeholder="john@example.com"
                  type="email"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 lg:space-y-2">
              <label className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-4 py-2.5 lg:py-3 focus:border-primary outline-none transition-all text-on-surface focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer text-sm lg:text-base"
              >
                <option value="Collaboration Inquiry">Collaboration Inquiry</option>
                <option value="Job Opportunity">Job Opportunity</option>
                <option value="Research discussion">Research discussion</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5 lg:space-y-2">
              <label className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-surface-container-lowest/80 border border-white/10 rounded-xl px-4 py-2.5 lg:py-3 focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/20 text-on-surface text-sm lg:text-base"
                placeholder="Your message..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-3 lg:py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(163,201,255,0.4)] transition-all active:scale-[0.99] cursor-pointer text-sm lg:text-base"
            >
              Send Transmission
            </button>
          </form>
        </div>
      </motion.div>

      {/* Floating success banner toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] glass-card px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl border-primary/25 border-l-4 border-l-primary"
          >
            <span className="material-symbols-outlined text-primary">check_circle</span>
            <div>
              <p className="text-xs font-bold text-on-surface">Transmission Sent</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">Meet Nakum will review your inquiry shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
