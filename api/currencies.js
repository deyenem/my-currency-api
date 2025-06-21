export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const API_KEY = process.env.EXCHANGE_API_KEY || 'prj_Pxiyf1zoTFnfKFzkaEN6rU1hSnz4';
    
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
    );
    
    const data = await response.json();
    
    if (data.result === 'error') {
      return res.status(400).json({
        error: data['error-type']
      });
    }

    const currencies = data.supported_codes.map(([code, name]) => ({
      code,
      name
    }));

    res.status(200).json({
      success: true,
      currencies,
      total: currencies.length
    });

  } catch (error) {
    console.error('Currencies API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch currencies list'
    });
  }
}
