#!/usr/bin/env node
// feishu-receiver.js - 飞书消息接收服务器

const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

const APP_ID = 'cli_a92b04eba7389bc4';
const APP_SECRET = 'CtmQkK5em1bkGqudqwreMcl8qnSVUkmA';
const PORT = 3000;

// 获取 tenant_access_token
async function getToken() {
    const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });
    const data = await res.json();
    return data.tenant_access_token;
}

// 接收飞书消息处理
async function handleMessage(payload) {
    const { header, event, message } = payload;
    console.log('收到消息:', JSON.stringify(payload, null, 2));

    if (!message || !message.content) return;

    // 解析用户消息
    let userText = '';
    try {
        const content = JSON.parse(message.content);
        userText = content.text || '';
    } catch (e) {
        userText = message.content;
    }

    if (!userText.trim()) return;

    console.log('用户消息:', userText);

    // 发送企微通知（已有的推送脚本）
    const wxpushCmd = 'powershell -ExecutionPolicy Bypass -File "D:/Claudecode-tao/bin/daily-push.ps1"';
    try {
        execSync(wxpushCmd, { stdio: 'pipe' });
    } catch (e) {}

    // 回复用户（通过飞书）
    const token = await getToken();
    const { chat_id, sender } = event || {};
    const userId = sender?.sender_id?.user_id || header?.event_id;

    console.log('回复消息给飞书...');
}

const server = http.createServer(async (req, res) => {
    // CORS 预检
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                console.log('收到飞书事件:', req.url);

                // URL 验证（飞书配置 webhook 时会先发 GET 验证）
                if (req.url === '/verify') {
                    const { challenge } = payload;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ challenge }));
                    return;
                }

                await handleMessage(payload);

                res.writeHead(200);
                res.end('{"code":0,"msg":"ok"}');
            } catch (e) {
                console.error('处理失败:', e);
                res.writeHead(500);
                res.end('error');
            }
        });
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log(`飞书消息接收服务已启动: http://localhost:${PORT}`);
    console.log(`公网地址: https://packet-poll-perry-physics.trycloudflare.com`);
    console.log(`Webhook URL: https://packet-poll-perry-physics.trycloudflare.com/feishu`);
});
