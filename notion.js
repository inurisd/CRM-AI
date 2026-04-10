// api/notion.js
// Vercel Serverless Function — CommonJS 형식
// Vercel 환경변수 설정 필요:
//   NOTION_API_KEY = ntn_xxxxxxx
//   CRM_PASSWORD   = 원하는비밀번호

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

  // API 키는 서버 환경변수에서만 사용
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Notion API 키가 서버에 설정되지 않았습니다' });
  }

  // 쿼리스트링에서 Notion 경로 추출
  // 예: /api/notion?path=/databases/xxx/query
  const notionPath = req.query.path || '/users/me';

  try {
    const response = await fetch('https://api.notion.com/v1' + notionPath, {
      method: req.method,
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
