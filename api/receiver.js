// Vercel serverless function - api/receiver.js
const APP_ID = 'cli_a92b04eba7389bc4';
const APP_SECRET = 'CtmQkK5em1bkGqudqwreMcl8qnSVUkmA';

let tokenCache = null;
let tokenExpiry = 0;
let userChatId = null; // 存储用户的 chat_id

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

async function sendReply(token, receiveId, content) {
    await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            msg_type: 'text',
            content: JSON.stringify({ text: content }),
            receive_id: receiveId
        })
    });
}

async function handleMessage(payload) {
    const { event, message, header } = payload;
    if (!message) return;

    // 获取 chat_id
    const chatId = message.chat_id || event?.chat?.chat_id;
    if (chatId) userChatId = chatId;

    let userText = '';
    try {
        const content = JSON.parse(message.content);
        userText = content.text || '';
    } catch (e) {
        userText = message.content || '';
    }

    console.log('收到消息:', userText, 'chat_id:', chatId);

    // 回复用户
    const token = await getToken();
    if (chatId && userText) {
        await sendReply(token, chatId, `三德子收到：「${userText}」\n主人，我会记住的！`);
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.query.challenge) {
        res.status(200).json({ challenge: req.query.challenge });
        return;
    }

    if (req.method === 'GET') {
        res.status(200).json({ status: 'ok', hasChatId: !!userChatId });
        return;
    }

    if (req.method === 'POST') {
        const body = req.body || {};
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
