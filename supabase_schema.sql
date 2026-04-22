-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  phone TEXT,
  whatsapp TEXT,
  ig TEXT,
  email TEXT,
  regions TEXT,
  about_roles TEXT,
  admin_id TEXT,
  admin_pass TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 2. Gallery Categories Table
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Media Items Table
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  section TEXT NOT NULL,
  label TEXT,
  title TEXT,
  size BIGINT,
  category TEXT,
  aspect TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Turn off RLS restrictions for all tables (for development/easy access with anon key)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON site_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON gallery_categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON media_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON faqs FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Settings
INSERT INTO site_settings (id, phone, whatsapp, ig, email, regions, about_roles, admin_id, admin_pass)
VALUES (1, '7870533594', '7870533594', '@memoriesbyhemant', 'memoriesbyhemant123@gmail.com', 'Bihar, Jharkhand, UP', 'CINEMATOGRAPHER, STORYTELLER, ARTIST, PHOTOGRAPHER, DIRECTOR', 'admin', 'hemant123')
ON CONFLICT (id) DO NOTHING;

-- Insert Default Categories
INSERT INTO gallery_categories (name) VALUES 
('WEDDING'), ('PREWEDDING'), ('EVENT'), ('PHOTO+VIDEO EDITING'), ('REEL'), ('MODEL SHOOT')
ON CONFLICT (name) DO NOTHING;
