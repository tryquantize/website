import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || process.env.VITE_AI_SERVICE_URL || 'https://website-ocrz.onrender.com';
    
    const response = await fetch(`${aiServiceUrl}/ecell-companies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('E-Cell companies API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch E-Cell companies',
      error: error.message,
      success: false 
    });
  }
}