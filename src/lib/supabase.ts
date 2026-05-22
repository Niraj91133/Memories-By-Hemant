import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createMockSupabase(): any {
  const isBrowser = typeof window !== 'undefined';

  const getStorageItem = (key: string, defaultVal: any) => {
    if (!isBrowser) return defaultVal;
    try {
      const val = localStorage.getItem(`mock_supabase:${key}`);
      return val ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setStorageItem = (key: string, val: any) => {
    if (isBrowser) {
      try {
        localStorage.setItem(`mock_supabase:${key}`, JSON.stringify(val));
      } catch (e) {
        console.error('Error writing to localStorage:', e);
      }
    }
  };

  const defaultSettings = {
    id: 1,
    phone: "7870533594",
    whatsapp: "7870533594",
    ig: "@memoriesbyhemant",
    email: "memoriesbyhemant123@gmail.com",
    regions: "Bihar, Jharkhand, UP",
    about_roles: "CINEMATOGRAPHER, STORYTELLER, ARTIST, PHOTOGRAPHER, DIRECTOR",
    admin_id: "admin",
    admin_pass: "hemant123"
  };

  const defaultCategories = [
    { name: "WEDDING" },
    { name: "PREWEDDING" },
    { name: "EVENT" },
    { name: "PHOTO+VIDEO EDITING" },
    { name: "REEL" },
    { name: "MODEL SHOOT" }
  ];

  const defaultMedia = [
    { id: "hero-default-0", url: "/images/memories1.png", type: "image", section: "Hero", title: "HOME_BANNER_1", aspect: "portrait" },
    { id: "hero-default-1", url: "/images/memories2.png", type: "image", section: "Hero", title: "HOME_BANNER_2", aspect: "portrait" },
    { id: "hero-default-2", url: "/images/memories3.png", type: "image", section: "Hero", title: "HOME_BANNER_3", aspect: "portrait" },
    { id: "hero-default-3", url: "/images/memories4.png", type: "image", section: "Hero", title: "HOME_BANNER_4", aspect: "portrait" },
    { id: "gallery-default-0", url: "/images/memories1.png", type: "image", section: "Gallery", title: "GALLERY_1", category: "WEDDING", aspect: "landscape" },
    { id: "gallery-default-1", url: "/images/memories2.png", type: "image", section: "Gallery", title: "GALLERY_2", category: "PREWEDDING", aspect: "portrait" },
    { id: "gallery-default-2", url: "/images/memories3.png", type: "image", section: "Gallery", title: "GALLERY_3", category: "EVENT", aspect: "portrait" },
    { id: "gallery-default-3", url: "/images/memories4.png", type: "image", section: "Gallery", title: "GALLERY_4", category: "PHOTO+VIDEO EDITING", aspect: "landscape" },
    { id: "gallery-default-4", url: "/images/engagement1.png", type: "image", section: "Gallery", title: "GALLERY_5", category: "REEL", aspect: "landscape" },
    { id: "gallery-default-5", url: "/images/engagement2.png", type: "image", section: "Gallery", title: "GALLERY_6", category: "MODEL SHOOT", aspect: "portrait" },
    { id: "gallery-default-6", url: "/images/engagement3.png", type: "image", section: "Gallery", title: "GALLERY_7", category: "WEDDING", aspect: "portrait" },
    { id: "gallery-default-7", url: "/images/wedding_stage.png", type: "image", section: "Gallery", title: "GALLERY_8", category: "PREWEDDING", aspect: "landscape" },
    { id: "gallery-default-8", url: "/images/memories1.png", type: "image", section: "Gallery", title: "GALLERY_9", category: "EVENT", aspect: "portrait" },
    { id: "gallery-default-9", url: "/images/memories2.png", type: "image", section: "Gallery", title: "GALLERY_10", category: "PHOTO+VIDEO EDITING", aspect: "landscape" },
    { id: "gallery-default-10", url: "/images/memories3.png", type: "image", section: "Gallery", title: "GALLERY_11", category: "REEL", aspect: "portrait" },
    { id: "gallery-default-11", url: "/images/memories4.png", type: "image", section: "Gallery", title: "GALLERY_12", category: "MODEL SHOOT", aspect: "landscape" },
    { id: "service-default-0", url: "/images/memories1.png", type: "image", section: "Services", title: "WEDDING", aspect: "portrait" },
    { id: "service-default-1", url: "/images/memories2.png", type: "image", section: "Services", title: "PREWEDDING", aspect: "portrait" },
    { id: "service-default-2", url: "/images/memories3.png", type: "image", section: "Services", title: "EVENT", aspect: "portrait" },
    { id: "service-default-3", url: "/images/memories4.png", type: "image", section: "Services", title: "PHOTO+VIDEO EDITING", aspect: "portrait" },
    { id: "service-default-4", url: "/images/memories1.png", type: "image", section: "Services", title: "REEL MAKING", aspect: "portrait" },
    { id: "service-default-5", url: "/images/memories2.png", type: "image", section: "Services", title: "MODEL SHOOT", aspect: "portrait" },
    { id: "service-default-6", url: "/images/memories3.png", type: "image", section: "Services", title: "DRONE CINEMATOGRAPHY", aspect: "portrait" },
    { id: "service-default-7", url: "/images/memories4.png", type: "image", section: "Services", title: "FASHION SHOOT", aspect: "portrait" },
    { id: "service-default-8", url: "/images/memories1.png", type: "image", section: "Services", title: "CORPORATE FILMS", aspect: "portrait" }
  ];

  const defaultFaqs = [
    { id: 'f1', question: "HOURS OF COVERAGE?", answer: "We provide comprehensive coverage tailored to your event, typically ranging from 8 to 14 hours per day to ensure no moment is missed." },
    { id: 'f2', question: "TRAVEL & ACCOMMODATION?", answer: "We travel globally. Destination wedding costs typically include flight and stay, which are handled transparently in our custom quotes." },
    { id: 'f3', question: "DELIVERY TIMELINE?", answer: "Cinematic trailers are delivered within 15 days. Complete high-res galleries and feature films take between 8-12 weeks." },
    { id: 'f4', question: "TEAM STRENGTH?", answer: "Depending on your scale, we deploy 4 to 12 specialists including cinematographers, candid photographers, and drone pilots." },
    { id: 'f5', question: "RAW DATA POLICY?", answer: "We provide high-resolution edited versions. RAW footage is stored for 2 years and can be provided upon specific professional requests." }
  ];

  return {
    from: (table: string) => {
      let data: any[] = [];
      if (table === 'site_settings') {
        data = [getStorageItem(table, defaultSettings)];
      } else if (table === 'gallery_categories') {
        data = getStorageItem(table, defaultCategories);
      } else if (table === 'media_items') {
        data = getStorageItem(table, defaultMedia);
      } else if (table === 'faqs') {
        data = getStorageItem(table, defaultFaqs);
      }

      const builder: any = {
        select: (cols?: string) => {
          return builder;
        },
        eq: (col: string, val: any) => {
          if (col === 'id' && table === 'site_settings') {
            data = data.filter(d => d.id === val);
          } else if (col === 'id' && table === 'media_items') {
            data = data.filter(d => d.id === val);
          }
          return builder;
        },
        neq: (col: string, val: any) => {
          data = data.filter(d => d[col] !== val);
          return builder;
        },
        single: async () => {
          return { data: data[0] || null, error: null };
        },
        update: (updates: any) => {
          if (table === 'site_settings') {
            const current = getStorageItem(table, defaultSettings);
            const updated = { ...current, ...updates };
            setStorageItem(table, updated);
          }
          return builder;
        },
        delete: () => {
          if (table === 'gallery_categories') {
            setStorageItem(table, []);
          } else if (table === 'faqs') {
            setStorageItem(table, []);
          } else if (table === 'media_items') {
            builder.isDelete = true;
          }
          return builder;
        },
        insert: async (records: any[]) => {
          if (table === 'gallery_categories') {
            const current = getStorageItem(table, defaultCategories);
            const updated = [...current, ...records];
            setStorageItem(table, updated);
          } else if (table === 'faqs') {
            const current = getStorageItem(table, defaultFaqs);
            const updated = [...current, ...records];
            setStorageItem(table, updated);
          }
          return { data: records, error: null };
        },
        upsert: async (records: any[]) => {
          if (table === 'media_items') {
            const current = getStorageItem(table, defaultMedia);
            records.forEach(rec => {
              const idx = current.findIndex((item: any) => item.id === rec.id);
              if (idx > -1) {
                current[idx] = { ...current[idx], ...rec };
              } else {
                current.push(rec);
              }
            });
            setStorageItem(table, current);
          }
          return { data: records, error: null };
        },
        then: (onfulfilled: any) => {
          if (builder.isDelete && table === 'media_items' && builder.deleteId) {
            const current = getStorageItem(table, defaultMedia);
            const filtered = current.filter((item: any) => item.id !== builder.deleteId);
            setStorageItem(table, filtered);
          }
          return Promise.resolve(onfulfilled({ data, error: null }));
        }
      };

      const originalEq = builder.eq;
      builder.eq = (col: string, val: any) => {
        if (builder.isDelete && table === 'media_items' && col === 'id') {
          builder.deleteId = val;
          const current = getStorageItem(table, defaultMedia);
          const filtered = current.filter((item: any) => item.id !== val);
          setStorageItem(table, filtered);
        }
        return originalEq(col, val);
      };

      return builder;
    }
  };
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createMockSupabase();

