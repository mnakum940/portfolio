"use client";

import { useEffect, useState } from "react";
import { getStoredSettings, DEFAULT_SETTINGS, ProfileSettings, formatSocialLink } from "../utils/db";

export default function Footer() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());

    const handleSync = () => {
      setSettings(getStoredSettings());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("settings_updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("settings_updated", handleSync);
    };
  }, []);

  return (
    <footer className="w-full py-8 border-t border-white/5 bg-surface-container-low/40 backdrop-blur-md relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto gap-4">
        <span className="font-display text-[16px] font-bold text-on-surface">
          {settings.name.toUpperCase()}
        </span>
        <p className="font-body text-on-surface-variant text-[10px] uppercase tracking-widest text-center md:text-left">
          © 2026 — Precision in Intelligence. Designed and engineered by {settings.name}.
        </p>
        <div className="flex gap-6">
          {settings.twitter && settings.twitter !== "#" && (
            <a
              className="text-[12px] tracking-[0.1em] font-bold uppercase text-on-surface-variant hover:text-on-surface transition-colors"
              href={formatSocialLink("twitter", settings.twitter)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          )}
          {settings.github && settings.github !== "#" && (
            <a
              className="text-[12px] tracking-[0.1em] font-bold uppercase text-on-surface-variant hover:text-on-surface transition-colors"
              href={formatSocialLink("github", settings.github)}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {settings.linkedin && settings.linkedin !== "#" && (
            <a
              className="text-[12px] tracking-[0.1em] font-bold uppercase text-on-surface-variant hover:text-on-surface transition-colors"
              href={formatSocialLink("linkedin", settings.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
