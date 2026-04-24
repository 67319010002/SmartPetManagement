import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from current folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function setupStorage() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Checking Supabase Storage...');

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;

    const bucketExists = buckets?.some(b => b.name === 'pets');

    if (!bucketExists) {
      console.log('📦 Creating "pets" bucket...');
      const { error: createError } = await supabase.storage.createBucket('pets', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      if (createError) throw createError;
      console.log('✅ "pets" bucket created successfully!');
    } else {
      console.log('✅ "pets" bucket already exists.');
    }

    // Set bucket to public just in case
    await supabase.storage.updateBucket('pets', { public: true });
    console.log('🌍 Bucket set to Public.');

  } catch (error) {
    console.error('❌ Error setting up storage:', error);
  }
}

setupStorage();
