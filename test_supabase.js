const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from('media_items').select('*');
  
  if (error) {
    console.error('Fetch Failed:', error.message);
  } else {
    console.log('Media Items in DB:', data.length);
    const logo = data.find(m => m.section === "Hero" && m.title === "LOGO");
    if (logo) console.log('Found Logo URL:', logo.url);
    else console.log('Logo not found in DB');
  }
}

test();
