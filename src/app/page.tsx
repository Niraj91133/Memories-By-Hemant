"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchSiteContent, getDefaultSiteContent, type SiteContent } from "@/lib/siteContent";

// Premium Lightbox Component matching reference
const Lightbox = ({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex,
  categories,
  activeCategory,
  onCategoryChange 
}: any) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentIndex((prev: number) => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [images.length, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-[#0A0A0A] flex flex-col items-center justify-center font-sans overflow-hidden select-none"
    >
      {/* Header Container */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 px-6 sm:px-12 flex items-center justify-between z-20">
        <button 
          onClick={onClose} 
          className="text-white/60 hover:text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase flex items-center gap-4 transition-all"
        >
          <span className="hidden sm:block w-8 h-px bg-white/20" /> BACK TO OVERVIEW
        </button>
        
        <div className="hidden sm:block text-white font-bold text-sm tracking-[0.2em] uppercase">
          MEMORIES BY <span className="text-[#830F1D]">HEMANT</span>
        </div>
        
        <button onClick={onClose} className="text-white/40 hover:text-white text-3xl transition-colors p-2">
          ×
        </button>
      </div>

      <div className="w-full h-full flex pt-16 sm:pt-24 relative overflow-hidden">
        {/* Left Sidebar: Categories - Hidden on Mobile */}
        <div className="hidden lg:flex w-64 flex-col px-12 py-12 gap-8 shrink-0 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-6">
            {categories.map((cat: string) => (
              <button 
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`text-left text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'text-white translate-x-2' 
                    : 'text-white/10 hover:text-white/30 hover:translate-x-1'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Center Stage: Main Image */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 sm:p-20 lg:p-24">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className="relative w-full h-full flex items-center justify-center perspective-1000"
            >
              {/* Corner Accents */}
              <div className="absolute -top-4 -left-4 w-6 h-6 border-t border-l border-white/20" />
              <div className="absolute -top-4 -right-4 w-6 h-6 border-t border-r border-white/20" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 border-b border-l border-white/20" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 border-b border-r border-white/20" />
              
              <div className="relative w-full h-full max-h-[70vh] sm:max-h-[80vh] flex items-center justify-center">
                <Image 
                  src={images[currentIndex].url} 
                  alt="Gallery content" 
                  width={1600}
                  height={1000}
                  className="w-auto h-auto max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                  priority
                />
              </div>

              {/* Mobile Arrows */}
              <div className="lg:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length); }}
                  className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto border border-white/10"
                >
                  <span className="mr-0.5 text-xl">{"<"}</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev: number) => (prev + 1) % images.length); }}
                  className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto border border-white/10"
                >
                  <span className="ml-0.5 text-xl">{">"}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls Overlay */}
          <div className="mt-8 sm:mt-16 flex items-center gap-10 sm:gap-16 text-white/30 font-black text-[9px] sm:text-[10px] tracking-widest z-10 transition-opacity">
            <button 
              onClick={() => setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length)}
              className="hover:text-[#830F1D] hover:scale-110 transition-all uppercase px-4 py-2"
            >
              PREV
            </button>
            <div className="flex items-center gap-4 text-white/60">
              <span className="text-white">{(currentIndex + 1).toString().padStart(2, '0')}</span>
              <span className="w-10 h-px bg-white/10" />
              <span>{images.length.toString().padStart(2, '0')}</span>
            </div>
            <button 
              onClick={() => setCurrentIndex((prev: number) => (prev + 1) % images.length)}
              className="hover:text-[#830F1D] hover:scale-110 transition-all uppercase px-4 py-2"
            >
              NEXT
            </button>
          </div>
        </div>

        {/* Right Sidebar: Filmstrip - Horizontal on Mobile, Vertical on Desktop */}
        <div className="flex lg:w-32 xl:w-40 lg:flex-col overflow-x-auto lg:overflow-y-auto no-scrollbar gap-2 sm:gap-4 px-4 sm:px-6 border-t lg:border-t-0 lg:border-l border-white/5 py-4 sm:py-8 shrink-0 bg-black/40 lg:bg-transparent absolute bottom-0 lg:static w-full h-auto lg:h-full z-30">
          {images.map((img: any, i: number) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              id={`thumb-${i}`}
              className={`relative aspect-[3/4] w-14 sm:w-20 lg:w-full shrink-0 transition-all duration-500 overflow-hidden rounded-sm ${
                i === currentIndex 
                  ? 'ring-2 ring-[#830F1D] scale-100 opacity-100' 
                  : 'opacity-10 hover:opacity-40 grayscale scale-90'
              }`}
            >
              <Image src={img.url} alt={`Thumb ${i}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [servicesPage, setServicesPage] = useState(0);
  const [activeGalleryCategory, setActiveGalleryCategory] = useState<string>("ALL");
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>(() => getDefaultSiteContent());
  const reelsRef = useRef<HTMLDivElement>(null);
  const visionsRef = useRef<HTMLDivElement>(null);
  const servicesScrollRef = useRef<HTMLDivElement>(null);
  const categoryGalleryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const content = await fetchSiteContent();
      setSiteContent(content);
      setMounted(true);
    };
    loadData();
  }, []);

  // Update roles from siteContent
  const aboutRoles_raw = siteContent.settings.about_roles.split(',').map(r => r.trim()).filter(Boolean);
  const roles = aboutRoles_raw.length > 0 ? aboutRoles_raw : ["CINEMATOGRAPHER", "STORYTELLER", "ARTIST", "PHOTOGRAPHER", "DIRECTOR"];

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [roles.length]);

  const scrollReels = (direction: 'left' | 'right') => {
    if (reelsRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      reelsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollVisions = (direction: 'left' | 'right') => {
    if (visionsRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      visionsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollServices = (direction: "left" | "right") => {
    if (!servicesScrollRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    servicesScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const heroPhotos = [
    "/images/memories1.png",
    "/images/memories2.png",
    "/images/memories3.png",
    "/images/memories4.png",
  ];

  const galleryCategories = [
    { name: "WEDDING", active: true },
    { name: "PREWEDDING", active: false },
    { name: "EVENT", active: false },
    { name: "PHOTO+VIDEO EDITING", active: false },
    { name: "REEL", active: false },
    { name: "MODEL SHOOT", active: false },
  ];

  const galleryImages = [
    { src: "/images/memories1.png", aspect: "landscape" },
    { src: "/images/memories2.png", aspect: "portrait" },
    { src: "/images/memories3.png", aspect: "portrait" },
    { src: "/images/memories4.png", aspect: "landscape" },
    { src: "/images/engagement1.png", aspect: "landscape" },
    { src: "/images/engagement2.png", aspect: "portrait" },
    { src: "/images/engagement3.png", aspect: "portrait" },
    { src: "/images/wedding_stage.png", aspect: "landscape" },
    { src: "/images/memories1.png", aspect: "portrait" },
    { src: "/images/memories2.png", aspect: "landscape" },
    { src: "/images/memories3.png", aspect: "portrait" },
    { src: "/images/memories4.png", aspect: "landscape" },
  ];

  const services = [
    { title: "WEDDING", src: "/images/memories1.png" },
    { title: "PREWEDDING", src: "/images/memories2.png" },
    { title: "EVENT", src: "/images/memories3.png" },
    { title: "PHOTO+VIDEO EDITING", src: "/images/memories4.png" },
    { title: "REEL MAKING", src: "/images/memories1.png" },
    { title: "MODEL SHOOT", src: "/images/memories2.png" },
    { title: "DRONE CINEMATOGRAPHY", src: "/images/memories3.png" },
    { title: "FASHION SHOOT", src: "/images/memories4.png" },
    { title: "CORPORATE FILMS", src: "/images/memories1.png" },
  ];

  type GalleryMediaItem = {
    id: string;
    url: string;
    type: "image" | "video";
    aspect: "portrait" | "landscape";
    category?: string;
  };

  const galleryContentFromAdmin = siteContent.media.filter((m) => m.section === "Gallery");
  const galleryMedia: GalleryMediaItem[] =
    galleryContentFromAdmin.length > 0
      ? galleryContentFromAdmin
          .filter((m): m is typeof m & { type: "image" | "video" } => m.type === "image" || m.type === "video")
          .map((m) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            aspect: m.aspect ?? "portrait",
            category: m.category ?? "",
          }))
      : galleryImages.map((img, i) => ({
          id: `gallery-fallback-${i}`,
          url: img.src,
          type: "image" as const,
          aspect: img.aspect as "landscape" | "portrait",
          category: "",
        }));

  const masonryContentFromAdmin = siteContent.media.filter((m) => m.section === "Masonry");
  const masonryMedia: GalleryMediaItem[] =
    masonryContentFromAdmin.length > 0
      ? masonryContentFromAdmin
          .filter((m): m is typeof m & { type: "image" | "video" } => m.type === "image" || m.type === "video")
          .map((m) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            aspect: m.aspect ?? "portrait",
            category: m.category ?? "",
          }))
      : galleryMedia; // Fallback to galleryMedia if masonry is empty

  const categoriesFromAdmin = (siteContent.galleryCategories && siteContent.galleryCategories.length > 0)
    ? siteContent.galleryCategories 
    : galleryCategories.map((c) => c.name);
    
  const servicesForHome = categoriesFromAdmin.map(cat => {
    const adminService = siteContent.media.find(m => m.section === "Services" && m.title?.toUpperCase() === cat.toUpperCase());
    return {
      title: cat.toUpperCase(),
      src: adminService?.url ?? "/images/memories1.png"
    };
  });
    
  const categoryButtonNames = Array.from(
    new Set(["ALL", ...categoriesFromAdmin.map((c) => c.toUpperCase())])
  );

  const filteredGalleryMedia =
    activeGalleryCategory === "ALL"
      ? galleryMedia
      : galleryMedia.filter((m) => (m.category ?? "").toUpperCase() === activeGalleryCategory);

  const filteredMasonryMedia = 
    activeGalleryCategory === "ALL"
      ? masonryMedia
      : masonryMedia.filter((m) => (m.category ?? "").toUpperCase() === activeGalleryCategory);

  const mobileGalleryLimit = 10;
  const shouldShowGalleryMore = filteredMasonryMedia.length > mobileGalleryLimit && !isGalleryExpanded;
  const visibleGalleryMedia = filteredMasonryMedia;

  const heroLogoUrl = siteContent.media.find((m) => m.section === "Hero" && m.title === "LOGO" && m.type === "image")?.url ?? "";
  const heroPhotosFromAdmin = siteContent.media
    .filter((m) => m.section === "Hero" && m.type === "image" && m.title !== "LOGO")
    .map((m) => m.url);
  const heroPhotosForTicker = heroPhotosFromAdmin.length > 0 ? heroPhotosFromAdmin : heroPhotos;

  const handleSelectGalleryCategory = (category: string) => {
    setActiveGalleryCategory(category);
    setIsGalleryExpanded(false);
  };

  const desktopServicesPageSize = 4;
  const desktopServicesPageCount = Math.max(1, Math.ceil(servicesForHome.length / desktopServicesPageSize));
  const desktopServicesStart = (servicesPage % desktopServicesPageCount) * desktopServicesPageSize;
  const desktopServicesVisible = [
    ...servicesForHome.slice(desktopServicesStart, desktopServicesStart + desktopServicesPageSize),
    ...servicesForHome.slice(0, Math.max(0, desktopServicesPageSize - (servicesForHome.length - desktopServicesStart))),
  ].slice(0, Math.min(desktopServicesPageSize, servicesForHome.length));

  const statsFromAdmin = siteContent.media
    .filter(m => m.section === "Stats")
    .map(m => ({
      value: m.title ?? "0",
      label: m.label ?? "STAT",
      sub: m.category ?? "", // Using category for sub-desc
      src: m.url
    }));

  const stats = statsFromAdmin.length > 0 ? statsFromAdmin : [
    { value: "800+", label: "WEDDINGS & EVENTS", sub: "We've captured over 800 stories globally, from intimate gatherings to grand celebrations.", src: "/images/memories3.png" },
    { value: "150", label: "DESTINATIONS", sub: "Projects our teams have designed, managed and delivered across various cultures.", src: "/images/wedding_stage.png" },
    { value: "1.2M", label: "MEMORIES CAPTURED", sub: "Individual frames captured, edited and delivered with cinematic precision.", src: "/images/engagement2.png" },
  ];

  const albumPhotosFromAdmin = siteContent.media
    .filter(m => m.section === "Albums")
    .map(m => m.url);
  const albumPhotos = albumPhotosFromAdmin.length > 0 ? albumPhotosFromAdmin : [
    "/images/memories1.png",
    "/images/engagement1.png",
    "/images/wedding_stage.png",
    "/images/memories2.png",
    "/images/engagement3.png",
  ];

  const instagramReelsFromAdmin = siteContent.media
    .filter(m => m.section === "Reels")
    .map(m => m.url);
  const instagramReels = instagramReelsFromAdmin.length > 0 ? instagramReelsFromAdmin : [
    "/images/memories2.png",
    "/images/engagement2.png",
    "/images/memories1.png",
    "/images/engagement3.png",
    "/images/wedding_stage.png",
    "/images/memories3.png",
    "/images/memories4.png",
  ];

  const faqs = siteContent.faqs.length > 0 ? siteContent.faqs.map(f => ({ q: f.question, a: f.answer })) : [
    { q: "HOURS OF COVERAGE?", a: "We provide comprehensive coverage tailored to your event, typically ranging from 8 to 14 hours per day to ensure no moment is missed." },
    { q: "TRAVEL & ACCOMMODATION?", a: "We travel globally. Destination wedding costs typically include flight and stay, which are handled transparently in our custom quotes." },
    { q: "DELIVERY TIMELINE?", a: "Cinematic trailers are delivered within 15 days. Complete high-res galleries and feature films take between 8-12 weeks." },
    { q: "TEAM STRENGTH?", a: "Depending on your scale, we deploy 4 to 12 specialists including cinematographers, candid photographers, and drone pilots." },
    { q: "RAW DATA POLICY?", a: "We provide high-resolution edited versions. RAW footage is stored for 2 years and can be provided upon specific professional requests." },
  ];

  const visionsFromAdmin = siteContent.media
    .filter(m => m.section === "Stories")
    .map(m => ({
      id: m.id,
      title: m.title ?? "STORY",
      desc: m.category ?? "", // Using category field for short desc
      src: m.url,
      html: m.label // HTML content
    }));

  const visions = visionsFromAdmin.length > 0 ? visionsFromAdmin : [
    { id: "v1", title: "CINEMATIC TALE", desc: "Crafting visual narratives that breathe life into your silent moments.", src: "/images/memories1.png" },
    { id: "v2", title: "RAW EMOTIONS", desc: "Capturing the unspoken words and tears of joy in every frame.", src: "/images/memories2.png" },
    { id: "v3", title: "TIMELESS ART", desc: "Ensuring your memories look as fresh 50 years from now as they do today.", src: "/images/memories3.png" },
    { id: "v4", title: "GLOBAL REACH", desc: "Taking your love story to the most beautiful corners of the Earth.", src: "/images/memories4.png" },
  ];

  const aboutImage = siteContent.media.find(m => m.section === "About" && m.title === "ME")?.url ?? "/images/memories2.png";


  return (
    <main className="relative w-full overflow-x-hidden selection:bg-[#830F1D] selection:text-[#FDFBF7] bg-[#FDFBF7]">
      
      {/* SECTION 1: HERO */}
      <section className="h-[90vh] sm:h-screen w-full flex flex-col justify-between items-center relative overflow-hidden bg-[#FDFBF7]">
        <div className="w-full flex-shrink-0 flex flex-col items-center pt-8 sm:pt-16 px-4 z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-black tracking-[0.5em] uppercase text-[#830F1D]">CINEMATIC STORYTELLERS</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="w-full flex-grow flex flex-col items-center justify-center text-center">
            {!mounted ? (
              <h1 className="font-bebas text-[12vw] sm:text-[10vw] lg:text-[8rem] xl:text-[9rem] leading-[0.8] uppercase tracking-tighter text-[#830F1D]">Memories by<br />Hemant</h1>
            ) : heroLogoUrl ? (
              <div className="w-full flex items-center justify-center px-4">
                <Image
                  src={heroLogoUrl}
                  alt="Memories by Hemant logo"
                  width={900}
                  height={300}
                  unoptimized
                  priority
                  className="h-16 sm:h-20 lg:h-32 w-auto object-contain"
                />
              </div>
            ) : (
              <h1 className="font-bebas text-[12vw] sm:text-[10vw] lg:text-[8rem] xl:text-[9rem] leading-[0.8] uppercase tracking-tighter text-[#830F1D]">Memories by<br />Hemant</h1>
            )}
          </motion.div>
        </div>
        <div className="w-full relative overflow-hidden pointer-events-none mt-auto min-h-[300px]">
          {mounted && (
            <div className="flex w-fit gap-3 sm:gap-4 animate-marquee items-end">
              {[...heroPhotosForTicker, ...heroPhotosForTicker, ...heroPhotosForTicker].map((src, index) => (
                <div key={index} className="relative w-[50vw] sm:w-[35vw] lg:w-[22vw] aspect-[4/5] flex-shrink-0 overflow-hidden grayscale shadow-2xl">
                  <Image 
                    src={src} 
                    alt={`Hero Image ${index + 1}`} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover" 
                    draggable={false} 
                    priority={index < 4} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-[45vw] font-black opacity-[0.01] pointer-events-none select-none z-0 text-[#830F1D]">2026</div>
      </section>

      {/* SECTION 2: CATEGORY GALLERY (MASONRY) */}
      <section
        ref={categoryGalleryRef}
        id="category-gallery"
        className={`w-full flex flex-col items-center bg-[#FDFBF7] py-12 sm:py-24 px-4 sm:px-12 xl:px-20 relative ${
          isGalleryExpanded ? "h-auto" : "h-[90vh] sm:h-screen overflow-hidden"
        }`}
      >
        <div className="w-full relative flex items-center mb-10 sm:mb-20">
          <button 
            onClick={() => {
              const el = document.getElementById("category-buttons-row");
              el?.scrollBy({ left: -200, behavior: "smooth" });
            }}
            className="hidden sm:flex shrink-0 w-10 h-10 border border-[#830F1D] items-center justify-center mr-4 hover:bg-[#830F1D] hover:text-white transition-all text-[#830F1D] font-bold"
          >
            ←
          </button>
          
          <div
            id="category-buttons-row"
            dir="ltr"
            className="flex-grow flex flex-nowrap overflow-x-auto no-scrollbar pb-2 scroll-smooth"
          >
            <div className="flex flex-nowrap gap-4 px-4 mx-auto min-w-min">
              {categoryButtonNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectGalleryCategory(name)}
                  className={`flex-shrink-0 px-6 py-2 border border-[#830F1D] text-[10px] font-black tracking-widest transition-all ${
                    activeGalleryCategory === name ? "bg-[#830F1D] text-white" : "bg-transparent text-[#830F1D] hover:bg-[#830F1D]/5"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => {
              const el = document.getElementById("category-buttons-row");
              el?.scrollBy({ left: 200, behavior: "smooth" });
            }}
            className="hidden sm:flex shrink-0 w-10 h-10 border border-[#830F1D] items-center justify-center ml-4 hover:bg-[#830F1D] hover:text-white transition-all text-[#830F1D] font-bold"
          >
            →
          </button>
        </div>

        <div className="w-full max-w-[1920px] columns-2 lg:columns-4 xl:columns-6 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {visibleGalleryMedia.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.1 }}
              onClick={() => setPreviewIndex(i)}
              className={`relative break-inside-avoid border border-[#830F1D] p-0.5 bg-transparent overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer ${
                item.aspect === "landscape" ? "aspect-[3/2]" : "aspect-[2/3]"
              } ${!isGalleryExpanded && i >= mobileGalleryLimit ? "hidden sm:block" : ""}`}
            >
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" muted loop autoPlay playsInline />
              ) : (
                <Image src={item.url} alt={`Gallery media ${i + 1}`} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              )}
            </motion.div>
          ))}
        </div>

        {(shouldShowGalleryMore || (!isGalleryExpanded && activeGalleryCategory === "ALL")) && (
          <div className="absolute bottom-0 left-0 w-full flex justify-center pb-10 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/80 to-transparent pt-32 pointer-events-none">
            <button
              onClick={() => setIsGalleryExpanded(true)}
              className="pointer-events-auto px-10 py-3 border border-[#830F1D] text-[#830F1D] bg-white font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase hover:bg-[#830F1D] hover:text-white transition-all active:scale-95 shadow-xl"
            >
              SHOW ALL STORIES
            </button>
          </div>
        )}
      </section>

      {/* SECTION 3: SERVICES */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative bg-black py-10 px-0 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="flex justify-center mb-12 lg:mb-24 px-4 sm:px-8">
          <div className="bg-[#830F1D] px-8 sm:px-16 py-3 sm:py-6 shadow-2xl">
             <h2 className="text-5xl sm:text-8xl lg:text-[10rem] font-black text-white tracking-tight leading-none uppercase">SERVICES</h2>
          </div>
        </motion.div>
        <div className="w-full max-w-[1440px] px-2 sm:px-12 flex flex-col items-center">
          <div className="w-full relative flex items-center justify-center gap-2 sm:gap-12 h-full">
            <button
              onClick={() => {
                setServicesPage((p) => (p - 1 + desktopServicesPageCount) % desktopServicesPageCount);
                if (window.innerWidth < 768) {
                    servicesScrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
                } else {
                    scrollServices("left");
                }
              }}
              className="flex flex-col items-center group cursor-pointer z-20 px-2"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 border border-[#830F1D] flex items-center justify-center mb-1 transition-colors group-hover:bg-[#830F1D]"><span className="text-[#830F1D] text-lg sm:text-xl font-bold group-hover:text-white transition-colors">{"←"}</span></div>
              <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-[#830F1D]">PREV</span>
            </button>
            <div className="w-full sm:flex-grow relative z-10 overflow-hidden">
              {/* Mobile: horizontal scroll */}
              <div ref={servicesScrollRef} className="md:hidden w-full overflow-x-auto no-scrollbar scroll-smooth py-4 touch-pan-x">
                <div className="flex w-fit gap-4 px-4">
                  {servicesForHome.map((service, i) => (
                    <motion.div 
                      key={i} 
                      onClick={() => {
                        handleSelectGalleryCategory(service.title.toUpperCase());
                        categoryGalleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      initial={{ opacity: 0, scale: 0.9 }} 
                      whileInView={{ opacity: 1, scale: 1 }} 
                      viewport={{ once: true }} 
                      transition={{ delay: i * 0.05 }} 
                      className="flex-shrink-0 flex flex-col group w-[75vw] sm:w-[65vw] cursor-pointer"
                    >
                      <span className="text-[10px] font-black tracking-tighter text-[#A1A1A1] mb-2 group-hover:text-[#830F1D] transition-colors">{service.title}</span>
                      <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/5 group-hover:border-[#830F1D]/40 transition-all">
                        <Image src={service.src} alt={service.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop: paged grid */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
                {desktopServicesVisible.map((service, i) => (
                  <motion.div 
                    key={`${service.title}-${i}`} 
                    onClick={() => {
                      handleSelectGalleryCategory(service.title.toUpperCase());
                      categoryGalleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    initial={{ opacity: 0, scale: 0.9 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }} 
                    transition={{ delay: i * 0.1 }} 
                    className="flex flex-col group cursor-pointer"
                  >
                    <span className="text-[9px] sm:text-[11px] font-black tracking-tighter text-[#A1A1A1] mb-2 sm:mb-4 group-hover:text-[#830F1D] transition-colors">{service.title}</span>
                    <div className="relative aspect-[2/3] w-full overflow-hidden border border-white/5 group-hover:border-[#830F1D]/40 transition-all">
                      <Image src={service.src} alt={service.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setServicesPage((p) => (p + 1) % desktopServicesPageCount);
                if (window.innerWidth < 768) {
                    servicesScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
                } else {
                    scrollServices("right");
                }
              }}
              className="flex flex-col items-center group cursor-pointer z-20 px-2"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 border border-[#830F1D] flex items-center justify-center mb-1 transition-colors group-hover:bg-[#830F1D]"><span className="text-[#830F1D] text-lg sm:text-xl font-bold group-hover:text-white transition-colors">{"→"}</span></div>
              <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-[#830F1D]">MORE</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: REDESIGNED STATISTICS */}
      <section id="statistics" className="h-[85vh] sm:h-screen w-full flex flex-col items-center justify-between bg-[#FDFBF7] pt-12 pb-6 sm:pt-24 sm:pb-12 px-6 relative overflow-hidden">
        {/* Animated Background Text Marquee */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full whitespace-nowrap opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-20"
          >
            {[1, 2, 3, 4].map(n => (
              <span key={n} className="text-[12rem] sm:text-[25rem] font-black text-black tracking-tighter uppercase">LEGACY LEGACY LEGACY</span>
            ))}
          </motion.div>
        </div>

        <div className="w-full max-w-7xl flex flex-col h-full justify-between relative z-10 py-2 sm:py-4">
          {/* Top: Introduction */}
          <div className="w-full flex-shrink-0 mb-4 sm:mb-8 text-center sm:text-left">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-[#830F1D] font-bold text-[9px] sm:text-[10px] tracking-[0.4em] mb-1 sm:mb-2 block uppercase leading-none">Statistical Journey</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-2xl sm:text-6xl font-bold tracking-tighter leading-none uppercase">Documenting the <span className="text-[#830F1D]">Unrepeatable.</span></motion.h2>
          </div>

          {/* Bottom: The Bento Grid - Anchored to Bottom on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-12 items-end">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col border-t border-black/10 pt-3 sm:pt-10"
              >
                {/* Text Container */}
                <div className="flex flex-col mb-1 sm:mb-6 min-h-[80px] sm:min-h-[140px] lg:min-h-[180px]">
                  <span className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-[#830F1D] leading-none mb-1 sm:mb-4">{stat.value}</span>
                  <span className="text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-0.5 sm:mb-3 text-black">{stat.label}</span>
                  <p className="text-[7px] sm:text-[10px] text-black/50 tracking-wider uppercase leading-relaxed max-w-[280px]">{stat.sub}</p>
                </div>
                
                {/* Parallel Image Alignment */}
                <div className="relative w-full h-20 sm:h-auto sm:aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <Image 
                    src={stat.src} 
                    alt="Stat visual" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[#830F1D]/5 group-hover:opacity-0 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: ALBUM & PHOTO EDITING */}
      <section className="h-screen w-full flex flex-col items-center justify-around bg-[#830F1D] py-6 sm:py-12 overflow-hidden relative">
        <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} className="w-full flex justify-center">
          <h2 className="font-bebas text-5xl sm:text-[8rem] lg:text-[11rem] text-white tracking-widest leading-none select-none">ALBUMS</h2>
        </motion.div>
        
        <div className="w-full text-center px-4">
          <motion.h3 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="text-white text-base sm:text-2xl lg:text-3xl font-black tracking-tight mb-2 sm:mb-4 leading-tight max-w-4xl mx-auto uppercase">Designs That Truly Cater to Your Emotional Memories.</motion.h3>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/70 text-[9px] sm:text-xs font-medium tracking-widest max-w-2xl mx-auto mb-4 sm:mb-6 uppercase leading-relaxed text-center">Discover bespoke albums that meet your aesthetic, premium, lifestyle and cinematic requirements.</motion.p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center items-center gap-2 text-white font-bold text-[9px] sm:text-xs tracking-wider"><span>GOOD SHOTS</span><span className="opacity-40">+</span><span>GOOD EDITS</span><span className="opacity-40">+</span><span>GOOD ALBUMS</span><span className="opacity-40">=</span><span className="text-black bg-white px-1.5 sm:px-2 py-0.5">GREAT MEMORIES</span></motion.div>
        </div>

        {/* MARQUEE CONTAINER - Adjusted Height to fit screen */}
        <div className="w-full relative flex items-center overflow-hidden h-[25vh] sm:h-[35vh]">
            <motion.div 
              animate={{ x: [0, -2000] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex gap-12 sm:gap-20 px-4 whitespace-nowrap items-center pointer-events-none"
            >
                {[...albumPhotos, ...albumPhotos, ...albumPhotos].map((src, i) => (
                 <div 
                   key={i} 
                   style={{ rotate: [2, -3, 2, -2][i % 4] + "deg" }}
                   className="flex-shrink-0 w-[60vw] sm:w-[40vw] lg:w-[25vw] aspect-video relative shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
                 >
                    <div className="relative w-full h-full border-[8px] sm:border-[16px] border-white p-1 bg-white shadow-2xl">
                      <Image 
                        src={src} 
                        alt="Album detail" 
                        fill 
                        sizes="(max-width: 768px) 70vw, 30vw"
                        className="object-cover" 
                      />
                    </div>
                 </div>
                ))}
            </motion.div>
        </div>
      </section>

      {/* SECTION 6: GALLERY */}
      <section className="h-screen w-full flex flex-col items-center justify-between bg-[#FDFBF7] pt-16 sm:pt-32 pb-0 relative overflow-hidden">
        {/* Top Content: Title and Button */}
        <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-8 sm:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            className="text-[12vw] sm:text-[10rem] lg:text-[12rem] font-bold text-[#830F1D] leading-none uppercase select-none tracking-tighter mb-6"
          >
            GALLERY
          </motion.h2>
          
          <div className="w-full relative overflow-hidden mb-8 sm:mb-12">
            <div className="w-full overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex flex-nowrap gap-2 sm:gap-4 px-8 mx-auto w-fit">
                {categoryButtonNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveGalleryCategory(cat)}
                    className={`flex-shrink-0 px-4 sm:px-6 py-2 border text-[8px] sm:text-[10px] font-black tracking-widest uppercase transition-all transform active:scale-95 ${
                      activeGalleryCategory === cat
                        ? "bg-[#830F1D] text-white border-[#830F1D]"
                        : "border-[#830F1D]/20 text-[#830F1D]/60 hover:border-[#830F1D] hover:text-[#830F1D]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Large Central Preview (Desktop hover) */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-[100] w-[85vw] sm:w-[50vw] lg:w-[35vw] aspect-square pointer-events-none"
            >
               <div className="relative w-full h-full border border-[#830F1D] bg-white shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden">
                  <Image 
                    src={(filteredGalleryMedia.length > 0 ? filteredGalleryMedia : galleryMedia)[hoveredIndex % (filteredGalleryMedia.length || galleryMedia.length)].url} 
                    alt="Gallery Zoomed" 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 border-[10px] sm:border-[20px] border-white/10" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {previewIndex !== null && (
            <Lightbox 
              isOpen={previewIndex !== null}
              onClose={() => setPreviewIndex(null)}
              images={filteredMasonryMedia}
              initialIndex={previewIndex % (filteredMasonryMedia.length || 1)}
              categories={categoryButtonNames}
              activeCategory={activeGalleryCategory}
              onCategoryChange={setActiveGalleryCategory}
            />
          )}
        </AnimatePresence>

        {/* Bottom Contact Sheet Pattern - Reverted to Original Square Grid */}
        <div className="w-full grid grid-cols-6 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-1.5 px-1 relative z-10">
          {Array.from({ length: 90 }).map((_, i) => {
            const currentImages = filteredMasonryMedia.length > 0 ? filteredMasonryMedia : galleryMedia;
            const item = currentImages[i % currentImages.length];
            const imgSrc = item.url;
            
            // Logic to match referral: 
            // Mobile: 4 rows of 6 cols = 24 images
            // Desktop: 3 rows of 15 cols = 45 images
            let isVisible = false;
            
            // For responsive visibility
            const index = i;

            return (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setPreviewIndex(i % (currentImages.length || 1))}
                className={`aspect-square border border-[#830F1D] overflow-hidden relative group cursor-pointer transition-all 
                  ${index >= 24 ? 'hidden' : 'block'} 
                  ${index >= 24 && index < 45 ? 'sm:block' : ''} 
                  ${index >= 45 ? 'hidden' : ''}`}
              >
                <Image 
                  src={imgSrc} 
                  alt={`Gallery box ${i}`} 
                  fill 
                  className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0" 
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: ABOUT ME */}
      <section className="h-auto w-full flex flex-col lg:flex-row bg-[#FDFBF7] relative overflow-hidden border-t border-black/5 py-16 sm:py-24">
        <div className="hidden lg:flex w-1/2 items-center justify-center border-r border-[#830F1D]/5">
           <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="relative w-full h-full px-12 xl:px-24 flex flex-col justify-center">
              <div className="relative w-full aspect-[4/5] border border-[#830F1D]/20">
                <Image src={aboutImage} alt="Hemant Portrait" fill className="object-cover grayscale" />
                <div className="absolute inset-0 bg-[#830F1D]/10 mix-blend-multiply" />
              </div>
           </motion.div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-12 xl:px-24 justify-center">
          {/* Mobile portrait (fix image not showing) */}
          <div className="lg:hidden w-full mb-10 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[4/5] border border-[#830F1D]/20">
              <Image src={aboutImage} alt="Hemant Portrait" fill className="object-cover grayscale" />
              <div className="absolute inset-0 bg-[#830F1D]/10 mix-blend-multiply" />
            </div>
          </div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-[14vw] sm:text-[6rem] lg:text-[8rem] font-bold text-[#830F1D] leading-none uppercase mb-6 sm:mb-8">ABOUT ME</motion.h2>
          <div className="flex flex-col gap-4 sm:gap-8">
            <span className="text-[10px] sm:text-sm font-black tracking-widest text-[#830F1D]">HEY !!</span>
            <p className="text-base sm:text-2xl lg:text-3xl font-black text-black leading-snug uppercase tracking-tight max-w-2xl">
              IM <span className="text-[#830F1D]">HEMANT</span> A 
              <span className="inline-block px-2 sm:px-4 mx-1 sm:mx-2 border border-[#830F1D]/30 italic text-[#830F1D] bg-transparent">
                <AnimatePresence mode="wait">
                  <motion.span key={roleIndex} initial={{ y: 20, opacity: 0, rotateX: -90 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: -20, opacity: 0, rotateX: 90 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="inline-block">&quot;{roles[roleIndex]}&quot;</motion.span>
                </AnimatePresence>
              </span> 
              INTO ALL THAT WORKS BEST FOR YOU AND YOUR EVENT AND WE CREATE THE MOST BEAUTIFUL CINEMATIC MEMORIES GLOBALLY.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mt-8 sm:mt-12">
              {servicesForHome.slice(0, 9).map((service, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, backgroundColor: "#830F1D", color: "#FFFFFF" }}
                  onClick={() => {
                    handleSelectGalleryCategory(service.title.toUpperCase());
                    categoryGalleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="border border-[#830F1D] px-2 sm:px-6 py-3 flex items-center justify-center text-center transition-all group"
                >
                  <span className="text-[8px] sm:text-xs font-black tracking-[0.1em] sm:tracking-[0.2em] group-hover:text-white leading-tight">{service.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: INSTAGRAM REELS */}
      <section className="bg-black py-16 sm:py-32 w-full flex flex-col overflow-hidden relative">
        <div className="w-full px-4 sm:px-12 xl:px-24 mb-12 sm:mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative">
           <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex flex-col gap-3 sm:gap-4 w-full">
              <motion.h2 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="text-5xl sm:text-7xl lg:text-9xl font-black text-[#830F1D] tracking-tight uppercase leading-none whitespace-normal sm:whitespace-nowrap">CINEMATIC STORIES</motion.h2>
           </motion.div>
           <div className="flex gap-4">
              <button onClick={() => scrollReels('left')} className="w-10 h-10 sm:w-12 sm:h-12 border border-[#830F1D] flex items-center justify-center transition-colors hover:bg-[#830F1D] group">
                <span className="text-[#830F1D] text-xl font-bold group-hover:text-white transition-colors">{"<"}</span>
              </button>
              <button onClick={() => scrollReels('right')} className="w-10 h-10 sm:w-12 sm:h-12 border border-[#830F1D] flex items-center justify-center transition-colors hover:bg-[#830F1D] group">
                <span className="text-[#830F1D] text-xl font-bold group-hover:text-white transition-colors">{">"}</span>
              </button>
           </div>
        </div>
        <div className="w-full relative py-2 sm:py-8 overflow-x-auto no-scrollbar scroll-smooth" ref={reelsRef}>
           <div className="flex w-fit gap-3 sm:gap-6 px-4 sm:px-8 py-4">
              {instagramReels.map((src, i) => (
                <motion.div key={i} whileHover={{ y: -20, scale: 1.05 }} className="relative w-[50vw] sm:w-[35vw] lg:w-[18vw] aspect-[9/16] rounded-xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 cursor-pointer group">
                   <Image src={src} alt={`Reel ${i}`} fill className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                         <div className="w-0 h-0 border-t-[6px] sm:border-t-[8px] border-t-transparent border-l-[10px] sm:border-l-[14px] border-l-white border-b-[6px] sm:border-b-[8px] border-b-transparent ml-1" />
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section className="h-auto w-full flex flex-col bg-[#FDFBF7] py-16 sm:py-32 px-4 sm:px-12 xl:px-24">
        <div className="w-full mb-12 lg:mb-24">
           <motion.h2 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="text-5xl sm:text-7xl lg:text-9xl font-black text-[#830F1D] tracking-tight uppercase leading-none">FAQs</motion.h2>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="flex flex-col h-auto aspect-video sm:aspect-auto sm:min-h-[500px]">
              <div className="relative w-full h-full border border-[#830F1D]/20 overflow-hidden group shadow-2xl">
                <Image src="/images/wedding_stage.png" alt="FAQ Main Display" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
           </motion.div>
           <div className="flex flex-col gap-0 border-t border-[#830F1D]/20 lg:border-t-0">
             {faqs.map((faq, i) => (
                <div key={i} className="border-b border-[#830F1D]/20 py-5 sm:py-8 group cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-sm font-black tracking-widest text-[#830F1D] uppercase">{faq.q}</span>
                      <motion.div animate={{ rotate: openFaq === i ? 45 : 135 }} className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center"><span className="text-[#830F1D] text-base sm:text-xl font-bold">{"<"}</span></motion.div>
                   </div>
                   <AnimatePresence>
                     {openFaq === i && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden">
                          <p className="mt-4 sm:mt-6 text-[9px] sm:text-xs font-bold leading-relaxed tracking-wider text-[#830F1D]/70 uppercase max-w-lg">{faq.a}</p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* SECTION 10: STORIES (BLOG SECTION) */}
      <section className="relative overflow-hidden group/vision bg-[#0A0A0A] py-16 sm:py-32">
        <div className="w-full px-4 sm:px-12 xl:px-24 mb-12 sm:mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
           <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex flex-col gap-3 sm:gap-4 w-full">
              <motion.h2 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="text-5xl sm:text-7xl lg:text-9xl font-black text-[#830F1D] tracking-tight uppercase leading-none">STORIES</motion.h2>
           </motion.div>
           <div className="flex gap-4">
              <button onClick={() => scrollVisions('left')} className="w-10 h-10 sm:w-12 sm:h-12 border border-[#830F1D] flex items-center justify-center transition-colors hover:bg-[#830F1D] group">
                <span className="text-[#830F1D] text-xl font-bold group-hover:text-white transition-colors">{"<"}</span>
              </button>
              <button onClick={() => scrollVisions('right')} className="w-10 h-10 sm:w-12 sm:h-12 border border-[#830F1D] flex items-center justify-center transition-colors hover:bg-[#830F1D] group">
                <span className="text-[#830F1D] text-xl font-bold group-hover:text-white transition-colors">{">"}</span>
              </button>
           </div>
        </div>

        <div className="relative z-10 w-full overflow-x-auto no-scrollbar scroll-smooth" ref={visionsRef}>
          <div className="flex w-fit gap-8 sm:gap-12 px-4 sm:px-12 xl:px-24">
              {visions.map((vision, idx) => (
                <a 
                  key={idx}
                  href={`/blog/${vision.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/card relative w-[75vw] sm:w-[45vw] lg:w-[30vw] aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 hover:border-[#830F1D]/50 transition-all shadow-2xl block shrink-0"
                >
                   <Image src={vision.src} alt={vision.title} fill className="object-cover grayscale transition-all duration-700 group-hover/card:grayscale-0 group-hover/card:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                      <span className="text-[10px] font-black text-[#830F1D] tracking-[0.3em] uppercase mb-2">CHAPTER {idx + 1}</span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tighter">{vision.title}</h3>
                      <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed font-bold uppercase tracking-widest group-hover/card:text-white/80 transition-colors">{vision.desc}</p>
                      
                      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between opacity-0 group-hover/card:opacity-100 transition-all translate-y-4 group-hover/card:translate-y-0">
                         <span className="text-[10px] font-black tracking-widest text-[#830F1D] uppercase">READ STORY</span>
                         <span className="text-xl">↗</span>
                      </div>
                   </div>
                </a>
              ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: FOOTER (DASHBOARD STYLE) */}
      <footer className="w-full bg-[#0F0F0F] text-white pt-12 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-12 xl:px-24">
        <div className="w-full max-w-[1920px] mx-auto border border-white/5 bg-[#161616] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col lg:flex-row">
          
          {/* LEFT: PROFILE CARD */}
          <div className="w-full lg:w-[40%] bg-[#830F1D] p-8 sm:p-16 flex flex-col justify-between relative group hover:bg-[#B13620] transition-colors duration-700 min-h-[350px] lg:h-auto">
             <div className="z-10">
                <h3 className="font-bebas text-4xl sm:text-7xl text-white leading-none mb-3">MEMORIES</h3>
                <p className="text-white/80 text-[9px] sm:text-xs font-bold tracking-[0.2em] leading-relaxed uppercase max-w-[200px]">
                  Hallo, I&apos;m Hemant. <br/>
                  I capture your ideas and talk about all things cinematic.
                </p>
             </div>

             {/* Profile Silhouette Image */}
             <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-1000 overflow-hidden">
                <Image src="/images/memories2.png" alt="Hemant Profile" fill className="object-cover grayscale" />
             </div>

             <div className="z-10 flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black tracking-widest text-[#FDFBF7]/50 uppercase mb-0.5">STAY CONNECTED</span>
                  <a href="tel:7870533594" className="text-white text-base sm:text-xl font-bold tracking-tighter hover:text-[#0F0F0F] transition-colors">+91 78705 33594</a>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black tracking-widest text-[#FDFBF7]/50 uppercase mb-0.5">GMAIL</span>
                  <a href="mailto:memoriesbyhemant123@gmail.com" className="text-white text-[10px] sm:text-sm font-bold tracking-tight hover:text-[#0F0F0F] transition-colors">memoriesbyhemant123@gmail.com</a>
                </div>
             </div>
          </div>

          {/* RIGHT: LINKS & CONTACT */}
          <div className="w-full lg:w-[60%] p-8 sm:p-16 grid grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-16 relative">
             
             {/* SERVICES COLUMN */}
             <div className="flex flex-col">
                <span className="text-[9px] font-black tracking-[0.3em] text-[#830F1D] mb-6 uppercase">SERVICES</span>
                <ul className="flex flex-col gap-3">
                   {services.slice(0, 6).map((s, i) => (
                     <li key={i} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-1">
                        <span className="text-[9px] sm:text-[11px] font-bold text-white/50 group-hover:text-white transition-colors">{s.title}</span>
                     </li>
                   ))}
                </ul>
             </div>

             {/* REGIONS COLUMN */}
             <div className="flex flex-col">
                <span className="text-[9px] font-black tracking-[0.3em] text-[#830F1D] mb-6 uppercase">AREAS</span>
                <ul className="flex flex-col gap-3">
                   {["BIHAR", "JHARKHAND", "UP", "DELHI", "GLOBAL"].map((region, i) => (
                     <li key={i} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-1">
                        <span className="text-[9px] sm:text-[11px] font-bold text-white/50 group-hover:text-white transition-colors">{region}</span>
                     </li>
                   ))}
                </ul>
             </div>

             {/* CONNECT COLUMN */}
             <div className="col-span-2 lg:col-span-1 flex flex-col justify-between mt-8 lg:mt-0">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black tracking-[0.3em] text-[#830F1D] mb-6 uppercase">CHANNELS</span>
                   <div className="flex flex-col gap-3">
                      <a href="https://instagram.com/memoriesbyhemant" target="_blank" className="text-[10px] sm:text-[11px] font-bold text-white/50 hover:text-white transition-colors">INSTAGRAM</a>
                      <a href="https://wa.me/7870533594" className="text-[10px] sm:text-[11px] font-bold text-white/50 hover:text-white transition-colors">WHATSAPP</a>
                   </div>
                </div>

                <div className="pt-10">
                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full bg-[#830F1D] text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full font-black text-[10px] sm:text-xs tracking-widest uppercase hover:bg-white hover:text-[#830F1D] transition-all">
                      Book a session
                   </motion.button>
                </div>
             </div>

          </div>
        </div>
        
        {/* FOOTER BOTTOM */}
        <div className="w-full max-w-[1920px] mx-auto mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-center sm:text-left">
           <span className="text-[8px] font-black tracking-[0.3em] text-white/20 uppercase">© 2026 MEMORIES BY HEMANT</span>
           <div className="flex gap-6">
              <span className="text-[8px] font-black tracking-widest text-white/20 uppercase">PRIVACY</span>
              <span className="text-[8px] font-black tracking-widest text-white/20 uppercase">TERMS</span>
              <a href="/admin" className="text-[8px] font-black tracking-widest text-[#830F1D] uppercase hover:text-white transition-colors">ADMIN</a>
           </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed right-4 sm:right-8 bottom-10 sm:bottom-12 z-[99] flex flex-col gap-3 sm:gap-4">
        {[
          { 
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            ), 
            href: "https://instagram.com/memoriesbyhemant", 
            color: "bg-white", 
            textColor: "text-[#830F1D]",
            label: "Instagram"
          },
          { 
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            ), 
            href: "https://wa.me/7870533594", 
            color: "bg-[#25D366]", 
            textColor: "text-white",
            label: "WhatsApp"
          },
          { 
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ), 
            href: "tel:7870533594", 
            color: "bg-[#830F1D]", 
            textColor: "text-white",
            label: "Call Us"
          }
        ].map((btn, i) => (
          <motion.a
            key={i}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className={`${btn.color} ${btn.textColor} p-3 sm:p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center border border-black/5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] transition-shadow group relative`}
          >
            {btn.icon}
            <span className="absolute right-full mr-4 bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap tracking-widest uppercase">
              {btn.label}
            </span>
          </motion.a>
        ))}
      </div>

      {/* GLOBAL NOISE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
        <Image src="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3%3E" alt="Noise" fill className="object-cover" />
      </div>
    </main>
  );
}
