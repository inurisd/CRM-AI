// /api/notion.js — Vercel Serverless Function
// GitHub 저장소의 /api/notion.js 위치에 저장하세요

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-notion-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = req.headers['x-notion-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key missing' });

  // Vercel에서 쿼리스트링으로 경로를 받음
  // index.html에서 /api/notion?path=/databases/xxx/query 형태로 호출
  const notionPath = req.query.path || '/';

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
