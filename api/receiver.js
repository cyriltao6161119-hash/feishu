// Vercel serverless function - api/receiver.js
const crypto = require('crypto');

const APP_ID = 'cli_a92b04eba7389bc4';
const APP_SECRET = 'CtmQkK5em1bkGqudqwreMcl8qnSVUkmA';

let tokenCache = null;
let tokenExpiry = 0;

async function getToken() {
    if (tokenCache && Date.now() < tokenExpiry) return tokenCache;
    const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });
    const data = await res.json();
    tokenCache = data.tenant_access_token;
    tokenExpiry = Date.now() + 7000 * 1000;
    return tokenCache;
}

async function handleMessage(payload) {
    const { event, message } = payload;
    if (!message) return;

    let userText = '';
    try {
        const content = JSON.parse(message.content);
        userText = content.text || '';
    } catch (e) {
        userText = message.content || '';
    }

    console.log('收到消息:', userText);
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET' && req.url === '/health') {
        res.status(200).json({ status: 'ok' });
        return;
    }

    if (req.method === 'POST') {
        const body = req.body || {};

        // 飞书 URL 验证
        if (body.challenge) {
            res.status(200).json({ challenge: body.challenge });
            return;
        }

        await handleMessage(body);

        res.status(200).json({ code: 0, msg: 'ok' });
        return;
    }

    res.status(404).json({ error: 'not found' });
};
