import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const gumroadSecret = process.env.GUMROAD_WEBHOOK_SECRET;

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
    const { license_key, email, test } = req.body;

    // Validate webhook signature if secret is provided
    if (gumroadSecret && req.headers['x-gumroad-signature']) {
      const signature = req.headers['x-gumroad-signature'] as string;
      const body = JSON.stringify(req.body);

      const hash = crypto
        .createHmac('sha256', gumroadSecret)
        .update(body)
        .digest('hex');

      if (hash !== signature) {
        console.warn('Invalid Gumroad webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Validate required fields
    if (!license_key || !email) {
      return res.status(400).json({
        error: 'License key and email are required'
      });
    }

    // Skip test webhooks if desired (set in env)
    if (test && process.env.SKIP_GUMROAD_TEST_WEBHOOKS === 'true') {
      console.log('Skipping test webhook');
      return res.status(200).json({ success: true, test: true });
    }

    // Insert or update license in Supabase
    const { error: insertError } = await supabase
      .from('licenses')
      .insert([
        {
          email: email.toLowerCase(),
          key: license_key,
          created_at: new Date().toISOString()
        }
      ])
      .on('*', payload => {
        console.log('License inserted:', payload);
      });

    if (insertError) {
      // Check if it's a unique constraint error (license already exists)
      if (insertError.code === '23505') {
        // License already exists, update it
        const { error: updateError } = await supabase
          .from('licenses')
          .update({ created_at: new Date().toISOString() })
          .eq('email', email.toLowerCase())
          .eq('key', license_key);

        if (updateError) {
          console.error('License update error:', updateError);
          return res.status(500).json({
            error: 'Failed to update license'
          });
        }
      } else {
        console.error('License insert error:', insertError);
        return res.status(500).json({
          error: 'Failed to store license'
        });
      }
    }

    console.log(`License stored for ${email}`);
    return res.status(200).json({
      success: true,
      email,
      license_key
    });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return res.status(500).json({
      error: 'Server error processing webhook'
    });
  }
}
