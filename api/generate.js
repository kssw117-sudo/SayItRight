// api/generate.js
// Один код доступа хранится в переменной окружения ACCESS_CODE на Vercel.
// AppSumo-коды (SIR-XXXX-XXXX) проверяются отдельно через GitHub-хранилище кодов.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseCode, content } = req.body || {};

  const isSharedCode = licenseCode && licenseCode === process.env.ACCESS_CODE;
  const isAppSumoCode = licenseCode && licenseCode.startsWith('SIR-');

  if (!licenseCode || (!isSharedCode && !isAppSumoCode)) {
    return res.status(403).json({ error: 'Invalid access code.' });
  }

  // Если это AppSumo-код -- проверяем его в codes.json на GitHub
  if (isAppSumoCode) {
    try {
      const ghRes = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${process.env.GITHUB_FILEPATH}`,
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
      );
      const ghData = await ghRes.json();
      const codes = JSON.parse(Buffer.from(ghData.content, 'base64').toString('utf-8'));
      const found = codes.find((c) => c.code === licenseCode);
      if (!found) {
        return res.status(403).json({ error: 'Code not recognized.' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Could not verify code right now.' });
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();

    return res.status(200).json({ result: clean });
  } catch (err) {
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
