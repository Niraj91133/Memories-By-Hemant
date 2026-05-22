require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Fetching media items...');
  const { data, error } = await supabase.from('media_items').select('*');
  if (error) {
    console.error('Fetch error:', error);
    return;
  }
  console.log(`Found ${data.length} items.`);
  if (data.length > 0) {
    console.log('First item ID:', data[0].id);
    console.log('Attempting to delete item with id non-existent-123...');
    const { error: delError } = await supabase.from('media_items').delete().eq('id', 'non-existent-123');
    if (delError) {
      console.error('Delete error:', delError);
    } else {
      console.log('Delete command executed without error (even if no rows matched).');
    }
  }
}

test();
