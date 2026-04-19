#!/usr/bin/env node
// feishu-push.js - 飞书推送脚本

const fetch = require('node-fetch');

const APP_ID = 'cli_a92b04eba7389bc4';
const APP_SECRET = 'CtmQkK5em1bkGqudqwreMcl8qnSVUkmA';
const CHAT_ID = process.argv[2] || '';  // 可选：发到指定群
const MESSAGE = process.argv.slice(3).join(' ') || '三德子推送测试';

async function getToken() {
    const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });
    const data = await res.json();
    return data.tenant_access_token;
}

async function sendMessage(token, content) {
    const body = {
        msg_type: 'text',
        content: JSON.stringify({ text: content })
    };

    // 如果有 CHAT_ID，发到群；否则发到应用订阅者
    let url;
    if (CHAT_ID) {
        url = `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`;
        body.receive_id = CHAT_ID;
    } else {
        url = `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id`;
        body.receive_id = 'me'; // 发给应用管理员自己
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('发送结果:', JSON.stringify(data));
    return data;
}

(async () => {
    const token = await getToken();
    await sendMessage(token, MESSAGE);
})();
