import { supabase } from './supabase';

export type MediaType = "image" | "video";
export type MediaAspect = "portrait" | "landscape";

export type MediaItem = {
  id: string;
  url: string;
  type: MediaType;
  section: string;
  label?: string;
  title?: string;
  size?: number;
  category?: string;
  aspect?: MediaAspect;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type SiteSettings = {
  phone: string;
  whatsapp: string;
  ig: string;
  email: string;
  regions: string;
  about_roles: string; // Comma separated Roles
  admin_id: string;
  admin_pass: string;
};

export type SiteContent = {
  v: 2;
  settings: SiteSettings;
  galleryCategories: string[];
  media: MediaItem[];
  faqs: FAQItem[];
};

const STORAGE_KEY = "memories:siteContent:v1";

const DEFAULT_GALLERY_CATEGORIES = [
  "WEDDING",
  "PREWEDDING",
  "EVENT",
  "PHOTO+VIDEO EDITING",
  "REEL",
  "MODEL SHOOT",
];

const DEFAULT_HERO_PHOTOS = [
  "/images/memories1.png",
  "/images/memories2.png",
  "/images/memories3.png",
  "/images/memories4.png",
];

const DEFAULT_GALLERY_MEDIA: Array<{ src: string; aspect: MediaAspect }> = [
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

const DEFAULT_SERVICES: Array<{ title: string; src: string }> = [
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

export function getDefaultSiteContent(): SiteContent {
  const galleryMedia = DEFAULT_GALLERY_MEDIA.map((item, i) => ({
    id: `gallery-default-${i}`,
    url: item.src,
    type: "image" as const,
    section: "Gallery",
    title: `GALLERY_${i + 1}`,
    category: DEFAULT_GALLERY_CATEGORIES[i % DEFAULT_GALLERY_CATEGORIES.length],
    aspect: item.aspect,
  }));

  const heroMedia = DEFAULT_HERO_PHOTOS.map((src, i) => ({
    id: `hero-default-${i}`,
    url: src,
    type: "image" as const,
    section: "Hero",
    title: `HOME_BANNER_${i + 1}`,
    aspect: "portrait" as const,
  }));

  const servicesMedia = DEFAULT_SERVICES.map((service, i) => ({
    id: `service-default-${i}`,
    url: service.src,
    type: "image" as const,
    section: "Services",
    title: service.title,
    aspect: "portrait" as const,
  }));

  return {
    v: 2,
    settings: {
      phone: "7870533594",
      whatsapp: "7870533594",
      ig: "@memoriesbyhemant",
      email: "memoriesbyhemant123@gmail.com",
      regions: "Bihar, Jharkhand, UP",
      about_roles: "CINEMATOGRAPHER, STORYTELLER, ARTIST, PHOTOGRAPHER, DIRECTOR",
      admin_id: "admin",
      admin_pass: "hemant123"
    },
    galleryCategories: DEFAULT_GALLERY_CATEGORIES,
    media: [...heroMedia, ...galleryMedia, ...servicesMedia],
    faqs: [
      { id: 'f1', question: "HOURS OF COVERAGE?", answer: "We provide comprehensive coverage tailored to your event, typically ranging from 8 to 14 hours per day to ensure no moment is missed." },
      { id: 'f2', question: "TRAVEL & ACCOMMODATION?", answer: "We travel globally. Destination wedding costs typically include flight and stay, which are handled transparently in our custom quotes." },
      { id: 'f3', question: "DELIVERY TIMELINE?", answer: "Cinematic trailers are delivered within 15 days. Complete high-res galleries and feature films take between 8-12 weeks." },
      { id: 'f4', question: "TEAM STRENGTH?", answer: "Depending on your scale, we deploy 4 to 12 specialists including cinematographers, candid photographers, and drone pilots." },
      { id: 'f5', question: "RAW DATA POLICY?", answer: "We provide high-resolution edited versions. RAW footage is stored for 2 years and can be provided upon specific professional requests." },
    ]
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const defaults = getDefaultSiteContent();
  
  try {
    const [
      { data: settings },
      { data: categories },
      { data: media },
      { data: faqs }
    ] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('gallery_categories').select('name'),
      supabase.from('media_items').select('*'),
      supabase.from('faqs').select('*')
    ]);

    return {
      v: 2,
      settings: settings ? { ...defaults.settings, ...settings } : defaults.settings,
      galleryCategories: categories && categories.length > 0 
        ? categories.map(c => c.name) 
        : defaults.galleryCategories,
      media: media && media.length > 0 
        ? media 
        : defaults.media,
      faqs: faqs && faqs.length > 0 
        ? faqs.map((f: any) => ({ id: f.id, question: f.question, answer: f.answer }))
        : defaults.faqs
    };
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return defaults;
  }
}

export async function saveSiteSettings(settings: SiteSettings) {
  const { error } = await supabase
    .from('site_settings')
    .update(settings)
    .eq('id', 1);
  if (error) console.error('Error saving settings:', error);
  return !error;
}

export async function saveGalleryCategories(categories: string[]) {
  // Simple sync: delete all and re-insert (not ideal but works for small lists)
  await supabase.from('gallery_categories').delete().neq('name', '');
  const { error } = await supabase.from('gallery_categories').insert(
    categories.map(name => ({ name }))
  );
  if (error) console.error('Error saving categories:', error);
  return !error;
}

export async function saveMediaItems(media: MediaItem[]) {
  const { error } = await supabase.from('media_items').upsert(
    media.map(item => ({
      id: item.id,
      url: item.url,
      type: item.type,
      section: item.section,
      label: item.label,
      title: item.title,
      size: item.size,
      category: item.category,
      aspect: item.aspect
    }))
  );
  if (error) console.error('Error saving media:', error);
  return !error;
}

export async function deleteMediaItem(id: string) {
  const { error } = await supabase.from('media_items').delete().eq('id', id);
  if (error) console.error('Error deleting media:', error);
  return !error;
}

export async function saveFAQs(faqs: FAQItem[]) {
    await supabase.from('faqs').delete().neq('id', '');
    const { error } = await supabase.from('faqs').insert(
      faqs.map(f => ({ id: f.id, question: f.question, answer: f.answer }))
    );
    if (error) console.error('Error saving FAQs:', error);
    return !error;
}

// Temporary compatibility function
export function loadSiteContent(): SiteContent {
    return getDefaultSiteContent();
}
