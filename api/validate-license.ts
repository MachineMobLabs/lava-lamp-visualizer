import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, key } = req.body;

    // Validate input
    if (!email || !key) {
      return res.status(400).json({
        valid: false,
        error: 'Email and license key are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid email format'
      });
    }

    // Query Supabase for matching license
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('key', key)
      .single();

    if (error) {
      // No matching license found
      return res.status(200).json({
        valid: false,
        error: 'Invalid email or license key'
      });
    }

    if (data) {
      // License found and valid
      return res.status(200).json({
        valid: true,
        email: data.email,
        activatedAt: data.created_at
      });
    }

    return res.status(200).json({
      valid: false,
      error: 'License not found'
    });
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Server error validating license'
    });
  }
}
