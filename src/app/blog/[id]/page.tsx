"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchSiteContent, getDefaultSiteContent } from "@/lib/siteContent";

export default function BlogPage() {
  const { id } = useParams();
  const [siteContent, setSiteContent] = useState(() => getDefaultSiteContent());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const content = await fetchSiteContent();
      setSiteContent(content);
      setMounted(true);
    };
    loadData();
  }, []);

  const story = siteContent.media.find(m => m.id === id && m.section === "Stories") || siteContent.media.find(m => m.id === id);
  
  if (!mounted) return <div className="min-h-screen bg-black" />;

  const blogData = story ? {
    title: story.title || "STORY",
    image: story.url,
    content: story.label || "<!-- Empty Content -->"
  } : {
    title: "STORY NOT FOUND",
    image: "/images/vision_bg.jpg",
    content: "<p>The story you are looking for does not exist.</p>"
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FDFBF7] relative selection:bg-[#830F1D] selection:text-white">
      {/* Film Grain/Noise */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
        <Image src="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3%3E" alt="Noise" fill className="object-cover" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="flex flex-col group">
          <span className="text-[10px] font-black tracking-[0.4em] text-[#830F1D] uppercase mb-0.5 group-hover:tracking-[0.6em] transition-all">MEMORIES</span>
          <span className="text-2xl font-bebas tracking-tighter text-white">BY HEMANT</span>
        </Link>
        <Link href="/" className="text-[10px] font-bold text-white/40 hover:text-[#830F1D] transition-colors uppercase tracking-widest border border-white/10 px-6 py-3 rounded-full hover:border-[#830F1D]">BACK HOME</Link>
      </header>

      {/* HERO IMAGE */}
      <section className="h-[60vh] relative overflow-hidden">
        <Image src={blogData.image} alt={blogData.title} fill className="object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
      </section>

      {/* BLOG CONTENT */}
      <main className="max-w-4xl mx-auto px-6 sm:px-12 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          dangerouslySetInnerHTML={{ __html: blogData.content }}
        />
      </main>

      {/* FOOTER MINI */}
      <footer className="border-t border-white/5 py-20 px-6 sm:px-12 text-center flex flex-col items-center gap-12">
        <Link href="/" className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.4em] text-[#830F1D] uppercase mb-0.5">MEMORIES</span>
          <span className="text-3xl font-bebas tracking-tighter text-white">BY HEMANT</span>
        </Link>
        <p className="text-[10px] font-bold text-white/20 tracking-[0.5em] uppercase">ALL RIGHTS RESERVED © 2026</p>
      </footer>
    </div>
  );
}
