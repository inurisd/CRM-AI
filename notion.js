// /api/notion.js
// Vercel Serverless Function — Notion API 프록시
// 이 파일을 GitHub 저장소의 /api/notion.js 위치에 저장하세요

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-notion-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = req.headers['x-notion-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key missing' });

  // URL에서 /api/notion 이후 경로 추출
  // 예: /api/notion/databases/xxx/query → /databases/xxx/query
  const notionPath = req.url.replace(/^\/api\/notion/, '') || '/';

  try {
    const notionRes = await fetch('https://api.notion.com/v1' + notionPath, {
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

    const data = await notionRes.json();
    return res.status(notionRes.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
