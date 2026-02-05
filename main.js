const os = require('os');

module.exports = async (sock, msg, config) => {
    const { chat, body, isGroup, pushName } = msg; 
    const prefix = config.prefix || '.';
    const senderNumber = msg.sender ? msg.sender.split('@')[0].split(':')[0] : '';
    const isOwner = config.ownerNumber.includes(senderNumber);

    // --- SMART USERNAME ---
    const userName = pushName || config.ownerName;

    // --- MAUJANJA: AUTO HOST DETECTOR (CLEAN VERSION) ---
    const getHost = () => {
        const platform = os.platform();
        if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) return 'Termux';
        if (process.env.HEROKU_APP_NAME) return 'Heroku';
        if (platform === 'win32') return 'Windows';
        if (platform === 'linux') return 'VPS Server';
        if (platform === 'darwin') return 'MacOS';
        return 'Web Host';
    };

    // --- RUNTIME CALCULATOR ---
    const runtime = (seconds) => {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    }

    // --- COMMAND: MENU / HELP ---
    if (body === prefix + 'menu' || body === prefix + 'help') {
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();
        
        const menuText = `
*╭─▣〔 CHUBWA-MD 〕─▣*
*│* 👤 *Owner:* ${userName}
*│* ⌚ *Time:* ${time}
*│* 📅 *Date:* ${date}
*│* ⏳ *Uptime:* ${runtime(process.uptime())}
*│* 👨‍💻 *Rank:* ${isOwner ? 'Developer' : 'Premium User'}
*│* 📶 *Host:* ${getHost()}
*╰──────────────▣*

*┏▣ 🛠️ ADMIN  ─▣*
*┃* ➽ antilink
*┃* ➽ antigroupmantion 
*┃* ➽ autoviewstatus
*┃* ➽ autoreactstatus
*┃* ➽ autobio
*┗▣*

*┏▣ 🌐 PUBLIC  ─▣*
*┃* ➽ ping 
*┃* ➽ alive 
*┃* ➽ owner 
*┃* ➽ developer
*┃* ➽ runtime 
*┗▣*

*_© 2026 Powered By Chubwa Boy_*`;

        return sock.sendMessage(chat, { text: menuText }, { quoted: msg });
    }

    // --- MAUJANJA: PING PRO ---
    if (body === prefix + 'ping') {
        const start = Date.now();
        const { key } = await sock.sendMessage(chat, { text: '📡 *CHUBWA-MD SYSTEM SCANNING...*' }, { quoted: msg });
        const end = Date.now();
        return sock.sendMessage(chat, { 
            text: `*✅ SYSTEM STABLE*\n*🚀 Latency:* ${end - start}ms\n*💻 RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
            edit: key 
        });
    }

    // --- MAUJANJA: OWNER INFO ---
    if (body === prefix + 'owner') {
        const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + `FN:${userName}\n` + `ORG:Chubwa MD;\n` + `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber[0]}:${config.ownerNumber[0]}\n` + 'END:VCARD';
        return sock.sendMessage(chat, { contacts: { displayName: userName, contacts: [{ vcard }] } }, { quoted: msg });
    }

    // --- MAUJANJA: DEVELOPER COMMAND ---
    if (body === prefix + 'developer') {
        const devNumber = '255775923311'; 
        const vcardDev = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + `FN:Chubwa Boy\n` + `ORG:Developer of Chubwa MD;\n` + `TEL;type=CELL;type=VOICE;waid=${devNumber}:${devNumber}\n` + 'END:VCARD';
        return sock.sendMessage(chat, { 
            contacts: { 
                displayName: "Chubwa Boy", 
                contacts: [{ vcard: vcardDev }] 
            } 
        }, { quoted: msg });
    }

    // --- MAUJANJA: RUNTIME COMMAND ---
    if (body === prefix + 'runtime') {
        return sock.sendMessage(chat, { text: `*⏳ CHUBWA-MD UPTIME:* ${runtime(process.uptime())}` }, { quoted: msg });
    }

    // --- MAUJANJA: ALIVE COMMAND ---
    if (body === prefix + 'alive') {
        return sock.sendMessage(chat, { text: "🔥 *CHUBWA-MD IS ONLINE AND STABLE* ✅\n\n_System is running on high performance._" }, { quoted: msg });
    }
};

