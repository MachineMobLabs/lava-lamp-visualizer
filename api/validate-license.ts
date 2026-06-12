import type { VercelRequest, VercelResponse } from '@vercel/node';

const productId = process.env.GUMROAD_PRODUCT_ID;
const accessToken = process.env.GUMROAD_ACCESS_TOKEN;

if (!productId) {
  throw new Error('Missing GUMROAD_PRODUCT_ID in environment variables');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { license_key } = req.body;

    // Validate input
    if (!license_key) {
      return res.status(400).json({
        valid: false,
        error: 'License key is required'
      });
    }

    // Call Gumroad's license verification API
    const params = new URLSearchParams();
    params.append('product_id', productId);
    params.append('license_key', license_key);
    params.append('increment_uses_count', 'true');

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers,
      body: params.toString(),
    });

    const data = await response.json();

    // Check if license is valid
    if (data.success) {
      const purchase = data.purchase;

      // Reject if refunded or chargebacked
      if (purchase.refunded || purchase.chargebacked) {
        return res.status(200).json({
          valid: false,
          error: 'This license has been refunded or charged back'
        });
      }

      // Optionally reject if uses exceeds limit (5 activations)
      const usesLimit = 5;
      if (purchase.refunded === false && purchase.chargebacked === false) {
        if (purchase.license_info?.uses > usesLimit) {
          return res.status(200).json({
            valid: false,
            error: `License activation limit exceeded (${usesLimit} activations)`
          });
        }
      }

      // License is valid
      return res.status(200).json({
        valid: true,
        email: purchase.email,
        product: purchase.product_name,
        activatedAt: new Date().toISOString()
      });
    }

    // License validation failed
    return res.status(200).json({
      valid: false,
      error: data.message || 'Invalid license key'
    });
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({
      valid: false,
      error: 'Server error validating license'
    });
  }
}
