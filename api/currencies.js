export default async function handler(req, res) {
  // Set CORS headers FIRST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const API_KEY = process.env.EXCHANGE_API_KEY || '6b2256511d4d75a4aea7bfaf';
    
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
    );
    
    if (!response.ok) {
      throw new Error(`Exchange API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result === 'error') {
      return res.status(400).json({
        error: data['error-type'] || 'API Error',
        success: false
      });
    }

    const currencies = data.supported_codes.map(([code, name]) => ({
      code,
      name
    }));

    res.status(200).json({
      success: true,
      currencies,
      total: currencies.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Currencies API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch currencies list',
      success: false
    });
  }
}
