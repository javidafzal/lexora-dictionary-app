import React from "react";
import { NavBar } from "./NavBar";
import { SmokeyBackground } from "@/components/ui/smokey-background";

export const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Ambient animated background, shared across every page that uses the navbar */}
      <div className="fixed inset-0 z-0">
        <SmokeyBackground color="#C9A24B" opacity={0.35} backdropBlurAmount="3xl" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">{children}</main>
      </div>
    </div>
  );
};
