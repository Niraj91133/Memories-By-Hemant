import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
  const cloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

  let supabaseConnected = false;
  let supabaseError: string | null = null;
  let supabaseTableNameTested: string = 'site_settings';

  if (supabaseConfigured) {
    try {
      const client = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await client.from('site_settings').select('id').eq('id', 1).single();
      if (error) {
        console.log('Supabase diagnostics error object:', { code: error.code, message: error.message, typeOfCode: typeof error.code });
        // If row 1 is missing, it still connected successfully (the table exists)
        const errCode = String(error.code || '');
        const errMessage = String(error.message || '');
        if (errCode.includes('PGRST116') || errMessage.includes('PGRST116') || errMessage.includes('multiple (or no) rows')) {
          supabaseConnected = true;
        } else {
          supabaseError = `${error.code}: ${error.message}`;
        }
      } else {
        supabaseConnected = true;
      }
    } catch (e: any) {
      supabaseError = e.message || 'Unknown database connection error';
    }
  }

  let cloudinaryConnected = false;
  let cloudinaryError: string | null = null;

  if (cloudinaryConfigured) {
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      // Call Cloudinary ping API to verify credentials
      const res = await cloudinary.api.ping();
      if (res && res.status === 'ok') {
        cloudinaryConnected = true;
      } else {
        cloudinaryError = 'Ping response not OK';
      }
    } catch (e: any) {
      cloudinaryError = e.message || 'Cloudinary authentication failed';
    }
  }

  return NextResponse.json({
    supabase: {
      configured: supabaseConfigured,
      connected: supabaseConnected,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : null,
      error: supabaseError
    },
    cloudinary: {
      configured: cloudinaryConfigured,
      connected: cloudinaryConnected,
      cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : null,
      error: cloudinaryError
    }
  });
}
