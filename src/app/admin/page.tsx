"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import {
  fetchSiteContent,
  saveSiteSettings,
  saveGalleryCategories,
  saveMediaItems,
  deleteMediaItem,
  saveFAQs,
  getDefaultSiteContent,
  type MediaAspect,
  type MediaItem,
  type SiteSettings,
  type FAQItem,
  type SiteContent
} from "@/lib/siteContent";
export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("Hero");
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getDefaultSiteContent().settings);
  const [galleryCategories, setGalleryCategories] = useState<string[]>(() => getDefaultSiteContent().galleryCategories);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>(() => getDefaultSiteContent().galleryCategories[0] ?? "");
  const [media, setMedia] = useState<MediaItem[]>(() => getDefaultSiteContent().media);
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getDefaultSiteContent().faqs);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [newGalleryCategory, setNewGalleryCategory] = useState("");
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });

  useEffect(() => {
    const loadData = async () => {
      const content = await fetchSiteContent();
      setSiteSettings(content.settings);
      setGalleryCategories(content.galleryCategories);
      setMedia(content.media);
      setFaqs(content.faqs || []);
      setMounted(true);
    };
    loadData();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const sections = [
    "Hero",
    "Masonry",
    "Gallery",
    "Services",
    "Stats",
    "Albums",
    "FAQ",
    "Stories", // Renamed from Vision
    "Reels",
    "About",
    "Settings"
  ];

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Removed autosave to avoid excessive Supabase calls. Use Publish button instead.
  // useEffect(() => {
  //   if (mounted) {
  //     saveSiteContent({ v: 2, settings: siteSettings, galleryCategories, media, faqs });
  //   }
  // }, [galleryCategories, media, siteSettings, faqs, mounted]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isIdMatch = !siteSettings.admin_id || loginId === siteSettings.admin_id;
    const isPassMatch = loginPass === siteSettings.admin_pass;

    if (isIdMatch && isPassMatch) {
      setIsAuthenticated(true);
      showNotification("Welcome back, Hemant", "success");
    } else {
      setLoginError("Invalid credentials. Access Denied.");
      showNotification("Authentication failed", "error");
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  const getAspect = async (file: File): Promise<MediaAspect> => {
    if (file.type.startsWith('video/')) return "landscape";
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve(img.width >= img.height ? "landscape" : "portrait");
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMedia((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    showNotification("Compressing and optimizing assets...", "info");

    try {
      if (swappingItemId) {
        // Handle swap
        const file = files[0];
        const isVideo = file.type.startsWith('video/');
        
        showNotification(`Uploading to Cloudinary...`, "info");
        const url = await uploadFile(file);
        const aspect = await getAspect(file);

        setMedia(prev => prev.map(item => 
          item.id === swappingItemId 
            ? { ...item, url, aspect, type: isVideo ? "video" : "image" } 
            : item
        ));
        setSwappingItemId(null);
        showNotification("File successfully updated", "success");
      } else {
        // Handle batch upload
        const newItems: MediaItem[] = [];
        for (const file of Array.from(files)) {
          const isVideo = file.type.startsWith('video/');
          
          showNotification(`Uploading ${file.name} to Cloudinary...`, "info");
          const url = await uploadFile(file);
          const aspect = await getAspect(file);

          const isAboutMe = activeSection === "About";
          const isStats = activeSection === "Stats";

          newItems.push({
            id: isAboutMe ? "about-me-image" : Math.random().toString(36).substr(2, 9),
            url: url,
            type: isVideo ? "video" : "image",
            section: activeSection === "Masonry" ? "Masonry" : activeSection,
            title: isAboutMe ? "ME" : (isStats ? "800+" : file.name.split('.')[0].toUpperCase()),
            label: isAboutMe ? "" : (isStats ? "WEDDINGS & EVENTS" : (activeSection === "Stories" ? "<!-- Add blog content here -->" : "")),
            category: isStats ? "We've captured over 800 stories globally..." : (activeSection === "Gallery" || activeSection === "Masonry" ? selectedGalleryCategory : ""),
            size: file.size,
            aspect,
          });
        }

        if (activeSection === "About") {
          setMedia((prev) => [newItems[0], ...prev.filter(m => !(m.section === "About" && m.title === "ME"))]);
        } else {
          setMedia((prev) => [...newItems, ...prev]);
        }
        showNotification(`Successfully uploaded ${newItems.length} assets`, "success");
      }
    } catch (error) {
      console.error(error);
      showNotification("Update failed. Please check file format.", "error");
    } finally {
      setIsUploading(false);
      setSwappingItemId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showNotification("Optimizing logo...", "info");

    try {
      showNotification("Uploading logo to Cloudinary...", "info");
      const url = await uploadFile(file);
      const aspect = await getAspect(file);
      
      const logoItem: MediaItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: url,
        type: "image",
        section: "Hero",
        title: "LOGO",
        aspect: aspect,
        size: file.size,
      };

      setMedia((prev) => [logoItem, ...prev.filter((m) => !(m.section === "Hero" && m.title === "LOGO"))]);
      showNotification("Logo updated", "success");
    } catch (error) {
      console.error(error);
      showNotification("Logo upload failed. Please try a different file.", "error");
    } finally {
      setIsUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const removeMedia = async (id: string) => {
    // Only delete from DB if it's not a default fallback ID
    if (!id.includes('default')) {
      await deleteMediaItem(id);
    }
    setMedia(prev => prev.filter(item => item.id !== id));
    showNotification("Asset removed successfully", "info");
  };

  const handleDetailsChange = (field: keyof SiteSettings, value: string) => {
    setSiteSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlogContentChange = (id: string, html: string) => {
    setMedia(prev => prev.map(item => item.id === id ? { ...item, label: html } : item));
  };

  const sectionContent = media.filter(item => {
    if (item.section !== activeSection) return false;
    if ((activeSection === "Gallery" || activeSection === "Masonry") && selectedGalleryCategory) {
      return item.category === selectedGalleryCategory;
    }
    return true;
  });
  const imageCount = sectionContent.filter(i => i.type === "image").length;
  const videoCount = sectionContent.filter(i => i.type === "video").length;

  const addGalleryCategory = () => {
    const value = newGalleryCategory.trim().toUpperCase();
    if (!value) return;
    setGalleryCategories((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setSelectedGalleryCategory((prev) => prev || value);
    setNewGalleryCategory("");
    showNotification("Category added", "success");
  };

  const removeGalleryCategory = (category: string) => {
    setGalleryCategories((prev) => prev.filter((c) => c !== category));
    setMedia((prev) => prev.map((m) => (m.section === "Gallery" && m.category === category ? { ...m, category: "" } : m)));
    if (selectedGalleryCategory === category) setSelectedGalleryCategory("");
    showNotification("Category removed", "info");
  };

  const handleServiceCoverUpload = async (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showNotification(`Updating cover for ${category}...`, "info");

    try {
      showNotification(`Uploading cover for ${category} to Cloudinary...`, "info");
      const url = await uploadFile(file);
      const aspect = await getAspect(file);

      const newItem: MediaItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: url,
        type: "image",
        section: "Services",
        title: category.toUpperCase(),
        aspect: aspect,
        size: file.size,
      };

      setMedia((prev) => [newItem, ...prev.filter((m) => !(m.section === "Services" && m.title === category))]);
      showNotification(`${category} cover updated`, "success");
    } catch (error) {
      console.error(error);
      showNotification("Upload failed", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (!mounted) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-[#830F1D] font-bebas text-4xl animate-pulse">LOADING DASHBOARD...</div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#111111] border border-white/5 rounded-3xl p-10 flex flex-col items-center">
        <div className="bg-[#830F1D]/10 w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-[#830F1D]/20">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Admin Access</h1>
        <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-8">Memories by Hemant</p>
        
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase">ID (OPTIONAL)</span>
            <input 
              type="text" 
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-[#830F1D] transition-colors font-bold"
              placeholder="YOUR ADMIN ID"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase">PASSWORD</span>
            <input 
              type="password" 
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-[#830F1D] transition-colors font-bold"
              placeholder="••••••••"
            />
          </div>
          {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center mt-2">{loginError}</p>}
          <button type="submit" className="bg-white text-black w-full py-5 rounded-xl font-black text-xs tracking-widest uppercase mt-4 hover:bg-[#830F1D] hover:text-white transition-all transform active:scale-95 shadow-2xl">
            UNLOCK DASHBOARD
          </button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FDFBF7] flex flex-col lg:flex-row relative selection:bg-[#830F1D] selection:text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay">
        <Image src="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3%3E" alt="Noise" fill className="object-cover" />
      </div>

      {/* SIDEBAR */}
      <aside className="w-full lg:w-80 h-auto lg:h-screen bg-[#111111] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col z-10 shrink-0">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.4em] text-[#830F1D] uppercase">MEMORIES</span>
            <span className="text-2xl font-bebas tracking-tighter text-white">DASHBOARD</span>
          </div>
          <Link href="/" className="text-[10px] font-bold text-white/40 hover:text-[#830F1D] transition-colors uppercase tracking-widest">EXIT</Link>
        </div>

        <nav className="flex-grow p-6 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-lg text-[11px] font-black tracking-[0.2em] uppercase transition-all ${
                activeSection === section 
                  ? "bg-[#830F1D] text-white shadow-[0_0_25px_rgba(209,67,42,0.3)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {section === "Masonry" ? "Category Gallery (Masonry)" : (section === "Gallery" ? "Gallery (Grid)" : section)}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
           <Link href="/" className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#830F1D] group-hover:border-transparent transition-all">
                 <span className="text-xs">↗</span>
              </div>
              <span className="text-[9px] font-bold text-white/40 tracking-widest uppercase group-hover:text-white transition-colors">VIEW LIVE SITE</span>
           </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-6 sm:p-12 lg:p-20 overflow-y-auto h-screen z-10 custom-scrollbar">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.5em] text-[#830F1D] uppercase mb-2">MANAGING SECTION</span>
              <h1 className="text-6xl sm:text-8xl font-bold text-white tracking-tighter leading-none mb-6">
                {activeSection === "Masonry" ? "Category Gallery" : (activeSection === "Gallery" ? "Standard Gallery" : activeSection)}
              </h1>
              
              {activeSection !== "Settings" && (
                <div className="flex gap-6 mt-2">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">IMAGES</span>
                      <span className="text-2xl font-bebas text-white">{imageCount}</span>
                  </div>
                  <div className="w-[1px] h-10 bg-white/10" />
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">VIDEOS</span>
                      <span className="text-2xl font-bebas text-white">{videoCount}</span>
                  </div>
                  {activeSection === "Albums" && (
                    <>
                      <div className="w-[1px] h-10 bg-white/10" />
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">CAPACITY</span>
                          <span className="text-2xl font-bebas text-white">{sectionContent.length}/50</span>
                      </div>
                    </>
                  )}
                  {(activeSection === "Gallery" || activeSection === "Masonry") && (
                    <>
                      <div className="w-[1px] h-10 bg-white/10" />
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">TOTAL</span>
                          <span className="text-2xl font-bebas text-white">{sectionContent.length}/{activeSection === "Masonry" ? 100 : 200}</span>
                      </div>
                    </>
                  )}
               </div>
            )}
            </div>
            <div className="flex gap-4">
                {activeSection !== "FAQ" && activeSection !== "About" && activeSection !== "Settings" && (
                  <>
                  {activeSection === "Hero" && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploading}
                        className={`bg-transparent border border-white/20 text-white px-8 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase transition-all transform active:scale-95 ${
                          isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-[#830F1D] hover:text-[#830F1D]"
                        }`}
                      >
                        UPLOAD LOGO
                      </button>
                    </>
                  )}
                  {(activeSection === "Gallery" || activeSection === "Masonry") && (
                    <select
                      value={selectedGalleryCategory}
                      onChange={(e) => setSelectedGalleryCategory(e.target.value)}
                      className="bg-[#111111] border border-white/10 rounded-full px-6 py-4 text-white outline-none focus:border-[#830F1D]/50 transition-colors text-[10px] font-black tracking-[0.2em] uppercase cursor-pointer"
                    >
                      <option value="">ALL ASSETS</option>
                      {galleryCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                   <input 
                     type="file" 
                     multiple 
                     accept="image/*,video/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                  />
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     disabled={isUploading}
                     className={`bg-white text-black px-8 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase transition-all transform active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#830F1D] hover:text-white'}`}
                   >
                     {activeSection === "Stats" ? "ADD STAT IMAGE" : (activeSection === "About" ? "UPLOAD ABOUT IMAGE" : (activeSection === "Stories" ? "NEW STORY" : (isUploading ? "OPTIMIZING..." : "UPLOAD NEW")))}
                   </button>
                  </>
                )}
              <button
                onClick={async () => {
                  setIsUploading(true);
                  showNotification("Publishing changes to Supabase...", "info");
                  try {
                    await Promise.all([
                      saveSiteSettings(siteSettings),
                      saveGalleryCategories(galleryCategories),
                      saveMediaItems(media),
                      saveFAQs(faqs)
                    ]);
                    showNotification("Changes published successfully!", "success");
                  } catch (error) {
                    showNotification("Failed to publish changes", "error");
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className="bg-[#830F1D] text-white px-8 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(209,67,42,0.4)] hover:scale-105 transition-all active:scale-95"
              >
                PUBLISH CHANGES
              </button>
            </div>
         </header>

         {/* Dynamic Content */}
         <div className="flex flex-col gap-12">
          {activeSection === "FAQ" && (
            <div className="flex flex-col gap-8 max-w-4xl">
              <div className="flex flex-col gap-4 bg-[#111111] p-8 border border-white/5 rounded-3xl">
                <span className="text-[10px] font-black tracking-[0.5em] text-[#830F1D] uppercase">ADD NEW FAQ</span>
                <input 
                  type="text" 
                  placeholder="QUESTION" 
                  value={newFAQ.question}
                  onChange={e => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-[#830F1D] font-bold text-xs"
                />
                <textarea 
                  placeholder="ANSWER" 
                  value={newFAQ.answer}
                  onChange={e => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-[#830F1D] font-bold text-xs min-h-[100px]"
                />
                <button 
                  onClick={() => {
                    if (!newFAQ.question || !newFAQ.answer) return;
                    setFaqs(prev => [...prev, { ...newFAQ, id: Math.random().toString(36).substr(2, 9) }]);
                    setNewFAQ({ question: "", answer: "" });
                    showNotification("FAQ added", "success");
                  }}
                  className="bg-white text-black px-8 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase hover:bg-[#830F1D] hover:text-white transition-all w-fit"
                >
                  ADD FAQ ITEM
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="flex flex-col gap-4 bg-[#111111] p-6 border border-white/5 rounded-2xl relative group">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 pr-12 w-full">
                        <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase">QUESTION</span>
                        <input 
                          type="text" 
                          value={faq.question}
                          onChange={e => {
                            const updated = [...faqs];
                            updated[i].question = e.target.value;
                            setFaqs(updated);
                          }}
                          className="bg-transparent text-white font-bold outline-none border-b border-transparent focus:border-[#830F1D]/40 pb-1 w-full"
                        />
                      </div>
                      <button onClick={() => setFaqs(prev => prev.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-500 transition-colors uppercase text-[9px] font-black shrink-0">REMOVE</button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase">ANSWER</span>
                      <textarea 
                        value={faq.answer}
                        onChange={e => {
                          const updated = [...faqs];
                          updated[i].answer = e.target.value;
                          setFaqs(updated);
                        }}
                        className="bg-transparent text-white/60 font-bold outline-none border-b border-transparent focus:border-[#830F1D]/40 pb-1 w-full text-xs min-h-[60px] resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "About" && (
            <div className="flex flex-col gap-12 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black tracking-[0.5em] text-[#830F1D] uppercase">PROFILE IMAGE</span>
                  <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
                    <Image 
                      src={media.find(m => m.section === "About" && m.title === "ME")?.url ?? "/images/memories2.png"} 
                      alt="About Me" 
                      fill 
                      className="object-cover grayscale" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-full font-black text-[9px] tracking-widest uppercase shadow-xl">CHANGE IMAGE</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#830F1D] tracking-[0.2em] uppercase">ROLES (COMMA SEPARATED)</label>
                    <input 
                      type="text" 
                      value={siteSettings.about_roles}
                      onChange={(e) => handleDetailsChange("about_roles", e.target.value)}
                      placeholder="CINEMATOGRAPHER, STORYTELLER, ARTIST"
                      className="bg-[#111111] border border-white/5 rounded-xl p-5 text-white outline-none focus:border-[#830F1D] transition-colors font-bold uppercase tracking-widest text-[10px]"
                    />
                    <p className="text-[9px] text-white/40 font-bold tracking-widest">THESE WILL APPEAR IN THE FLIPPING TEXT SECTION</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#830F1D] tracking-[0.2em] uppercase">PHONE</label>
                    <input 
                      type="text" 
                      value={siteSettings.phone}
                      onChange={(e) => handleDetailsChange("phone", e.target.value)}
                      className="bg-[#111111] border border-white/5 rounded-xl p-5 text-white outline-none focus:border-[#830F1D] transition-colors font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#830F1D] tracking-[0.2em] uppercase">EMAIL</label>
                    <input 
                      type="text" 
                      value={siteSettings.email}
                      onChange={(e) => handleDetailsChange("email", e.target.value)}
                      className="bg-[#111111] border border-white/5 rounded-xl p-5 text-white outline-none focus:border-[#830F1D] transition-colors font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "Settings" && (
           <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
              {Object.keys(siteSettings).map((key) => (
                key !== "about_roles" && key !== "phone" && key !== "email" && (
                 <div key={key} className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-[#830F1D] tracking-[0.2em] uppercase">{key.replace('_', ' ')}</label>
                    <input 
                      type={key.includes('pass') ? "password" : "text"}
                      value={siteSettings[key as keyof typeof siteSettings]}
                      onChange={(e) => handleDetailsChange(key as keyof typeof siteSettings, e.target.value)}
                      className="bg-[#111111] border border-white/5 rounded-xl p-5 text-white outline-none focus:border-[#830F1D] transition-colors font-bold"
                    />
                 </div>
                )
              ))}
           </div>
          )}

          {activeSection !== "FAQ" && activeSection !== "About" && activeSection !== "Settings" && (
            <>
              {activeSection === "Gallery" && (
                <section className="mb-12 flex flex-col gap-4">
                  <span className="text-[10px] font-black tracking-[0.5em] text-[#830F1D] uppercase">Gallery Categories</span>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <input
                      type="text"
                      value={newGalleryCategory}
                      onChange={(e) => setNewGalleryCategory(e.target.value)}
                      placeholder="Add new category (e.g. WEDDING)"
                      className="bg-[#111111] border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-[#830F1D]/50 transition-colors font-bold uppercase tracking-widest text-[10px]"
                    />
                    <button
                      onClick={addGalleryCategory}
                      className="bg-white text-black px-8 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase hover:bg-[#830F1D] hover:text-white transition-all active:scale-95"
                    >
                      ADD CATEGORY
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedGalleryCategory("")}
                      className={`px-4 py-2 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all ${
                        selectedGalleryCategory === ""
                          ? "bg-white text-black border-transparent"
                          : "border-white/10 text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      ALL ASSETS
                    </button>
                    {galleryCategories.map((c) => (
                      <div key={c} className="flex items-center">
                        <button
                          onClick={() => setSelectedGalleryCategory(c)}
                          className={`px-4 py-2 rounded-l-full border-y border-l text-[9px] font-black tracking-widest uppercase transition-all ${
                            selectedGalleryCategory === c
                              ? "bg-[#830F1D] text-white border-transparent"
                              : "border-white/10 text-white/40 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {c}
                        </button>
                        <button
                          onClick={() => removeGalleryCategory(c)}
                          className={`px-3 py-2 rounded-r-full border text-[9px] font-black tracking-widest uppercase transition-all hover:bg-red-600 hover:text-white ${
                            selectedGalleryCategory === c
                              ? "bg-[#830F1D]/80 text-white/80 border-transparent"
                              : "border-white/10 text-white/40"
                          }`}
                        >
                          REMOVE
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeSection === "Services" && (
                <section className="mb-12 flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black tracking-[0.5em] text-[#830F1D] uppercase">Service Covers</span>
                    <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Set custom cards for service section. Select a Gallery Category to update.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryCategories.map((cat) => {
                      const currentCover = media.find(m => m.section === "Services" && m.title?.toUpperCase() === cat.toUpperCase());
                      return (
                        <div key={cat} className="bg-[#161616] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 group">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black tracking-widest text-white uppercase">{cat}</span>
                            <div className={`w-2 h-2 rounded-full ${currentCover ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'}`} />
                          </div>
                          
                          <div className="relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/5">
                            {currentCover ? (
                              <Image src={currentCover.url} alt={cat} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/10 uppercase tracking-widest">DRAG COVER HERE</div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                              <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase bg-[#830F1D] px-4 py-2 rounded-full">CHANGE IMAGE</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleServiceCoverUpload(cat, e)}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                  {sectionContent.length > 0 ? (
                    sectionContent.map((item) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={item.id} 
                        className="group relative bg-[#161616] border border-white/5 rounded-2xl overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                            {item.type === "image" ? (
                              <Image src={item.url} alt="Upload" fill className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                            ) : (
                              <video src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0" muted loop autoPlay />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                              <button 
                                onClick={() => {
                                  setSwappingItemId(item.id);
                                  fileInputRef.current?.click();
                                }}
                                className="px-4 py-2 rounded-full bg-[#830F1D] text-white text-[8px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all transform hover:scale-110 active:scale-95 shadow-xl"
                              >
                                CHANGE IMAGE
                              </button>
                              <button 
                                onClick={() => removeMedia(item.id)}
                                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110 active:scale-90 shadow-xl border border-white/10"
                              >
                                  <span className="text-sm font-bold">✕</span>
                              </button>
                            </div>
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                              <span className="text-[8px] font-black text-white/60 tracking-widest uppercase">{item.type}</span>
                            </div>
                        </div>
                        <div className="p-6 bg-[#1A1A1A] border-t border-white/5 flex flex-col gap-4">
                          {activeSection === "Stats" ? (
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mb-1">STAT VALUE (TEXT IN RED)</span>
                                <input 
                                  type="text" 
                                  value={item.title ?? ""} 
                                  onChange={(e) => updateMediaItem(item.id, { title: e.target.value.toUpperCase() })}
                                  className="bg-[#0A0A0A] text-white text-[10px] font-bold tracking-widest outline-none border border-white/5 rounded-lg px-4 py-3 focus:border-[#830F1D]/40 w-full"
                                  placeholder="e.g. 800+"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mb-1">STAT LABEL (CATEGORY)</span>
                                <input 
                                  type="text" 
                                  value={item.label ?? ""} 
                                  onChange={(e) => updateMediaItem(item.id, { label: e.target.value.toUpperCase() })}
                                  className="bg-[#0A0A0A] text-white text-[10px] font-bold tracking-widest outline-none border border-white/5 rounded-lg px-4 py-3 focus:border-[#830F1D]/40 w-full"
                                  placeholder="e.g. WEDDINGS"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mb-1">SUBTITLE DESCRIPTION</span>
                                <textarea 
                                  value={item.category ?? ""} 
                                  onChange={(e) => updateMediaItem(item.id, { category: e.target.value })}
                                  className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 text-[10px] font-bold text-white/40 outline-none focus:border-[#830F1D]/40 resize-none min-h-[80px]"
                                  placeholder="Enter descriptive text..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mb-1">TITLE / LABEL</span>
                                <input 
                                  type="text" 
                                  value={item.title ?? ""} 
                                  onChange={(e) => updateMediaItem(item.id, { title: e.target.value.toUpperCase() })}
                                  className="bg-transparent text-white text-sm font-bold tracking-tight outline-none border-b border-white/5 focus:border-[#830F1D]/40 pb-1 w-full"
                                />
                              </div>

                              {activeSection === "Gallery" && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mb-1">CATEGORY</span>
                                  <select
                                    value={item.category ?? ""}
                                    onChange={(e) => updateMediaItem(item.id, { category: e.target.value })}
                                    className="bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#830F1D]/50 transition-colors text-[10px] font-black tracking-[0.2em] uppercase cursor-pointer"
                                  >
                                    <option value="">UNASSIGNED</option>
                                    {galleryCategories.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {activeSection === "Stories" && (
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mb-1">SHORT DESCRIPTION</span>
                                    <Link 
                                      href={`/blog/${item.id}`} 
                                      target="_blank"
                                      className="text-[8px] font-black text-white/40 hover:text-[#830F1D] transition-colors border border-white/10 px-3 py-1 rounded-full"
                                    >
                                      PREVIEW LIVE ↗
                                    </Link>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={item.category ?? ""} 
                                    onChange={(e) => updateMediaItem(item.id, { category: e.target.value })}
                                    className="bg-transparent text-white text-[10px] font-bold tracking-widest outline-none border-b border-white/5 focus:border-[#830F1D]/40 pb-1 w-full"
                                  />
                                  <span className="text-[9px] font-black text-[#830F1D] tracking-widest uppercase mt-4 mb-1">BLOG CONTENT (HTML)</span>
                                  <textarea 
                                    value={item.label}
                                    onChange={(e) => handleBlogContentChange(item.id, e.target.value)}
                                    placeholder="Enter blog HTML code..."
                                    rows={10}
                                    className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 text-[11px] font-mono text-white/60 outline-none focus:border-[#830F1D]/40 resize-y min-h-[200px]"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div layout className="col-span-full h-96 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl opacity-20">📁</div>
                      <p className="text-white/20 text-[10px] font-black tracking-widest uppercase">Zero assets inside {activeSection}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
         </div>
      </main>

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <div className="fixed bottom-8 right-8 z-[100]">
             <motion.div 
               initial={{ x: 100, opacity: 0, scale: 0.9 }} 
               animate={{ x: 0, opacity: 1, scale: 1 }}
               exit={{ x: 100, opacity: 0, scale: 0.9 }}
               className={`p-6 rounded-2xl shadow-2xl flex items-center gap-6 min-w-[320px] ${
                 notification.type === 'error' ? 'bg-red-600 text-white' : 
                 notification.type === 'success' ? 'bg-green-600 text-white' : 
                 'bg-white text-black'
               }`}
             >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                  notification.type === 'error' ? 'border-white/20' : 
                  notification.type === 'success' ? 'border-white/20' : 
                  'bg-[#830F1D] text-white border-transparent'
                }`}>
                   {notification.type === 'error' ? '!' : notification.type === 'success' ? '✓' : 'i'}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black tracking-widest uppercase opacity-60 text-current">
                      {notification.type === 'error' ? 'SYSTEM_ALERT' : 
                       notification.type === 'success' ? 'PROCESS_COMPLETE' : 
                       'STATUS_UPDATE'}
                   </span>
                   <span className="text-[11px] font-bold uppercase leading-tight text-current">{notification.message}</span>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
