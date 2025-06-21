export default async function handler(req, res) {
  // Set CORS headers FIRST, before any other code
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const API_KEY = process.env.EXCHANGE_API_KEY || 'YOUR_API_KEY_HERE';
    
    const { from = 'USD', to = 'EUR', amount = 1 } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        error: 'Missing required parameters: from and to currencies',
        success: false
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number',
        success: false
      });
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}`
    );
    
    if (!response.ok) {
      throw new Error(`Exchange API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result === 'error') {
      return res.status(400).json({
        error: data['error-type'] || 'API Error',
        message: 'Invalid currency code or API key issue',
        success: false
      });
    }

    const convertedAmount = (numAmount * data.conversion_rate).toFixed(2);
    
    res.status(200).json({
      success: true,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: data.conversion_rate,
      amount: numAmount,
      converted: parseFloat(convertedAmount),
      timestamp: new Date().toISOString(),
      last_updated: data.time_last_update_utc
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch exchange rates',
      success: false
    });
  }
}
