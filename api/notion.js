// api/notion.js
// Vercel Serverless Function — CommonJS 형식
// Vercel 환경변수 설정 필요:
//   NOTION_API_KEY = (Vercel 환경변수에서 설정)
//   CRM_PASSWORD   = (Vercel 환경변수에서 설정)
//   GEMINI_API_KEY = (Vercel 환경변수에서 설정)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-crm-password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 비밀번호 검증
  const pw = req.headers['x-crm-password'];
  if (!pw || pw !== process.env.CRM_PASSWORD) {
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다' });
  }

  const path = req.query.path || '';

  // ── Gemini 프록시 ──
  if (path === '/gemini') {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: 'Gemini API 키가 서버에 설정되지 않았습니다' });
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
        }
      );
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Notion 프록시 ──
  const notionPath = path || '/users/me';
  const notionKey = process.env.NOTION_API_KEY;
  if (!notionKey) {
    return res.status(500).json({ error: 'Notion API 키가 서버에 설정되지 않았습니다' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1' + notionPath, {
      method: req.method === 'GET' ? 'GET' : req.method,
      headers: {
        'Authorization': 'Bearer ' + notionKey,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
