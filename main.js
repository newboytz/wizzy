const os = require('os');                                                   const fs = require('fs');                                                   
module.exports = async (sock, msg, config) => {
    const { chat, body, isGroup, pushName } = msg;                              const prefix = config.prefix || '.';
    const senderNumber = msg.sender ? msg.sender.split('@')[0].split(':')[0] : '';                                                                          const isOwner = config.ownerNumber.includes(senderNumber);                                                                                              const userName = pushName || config.ownerName;
    const botName = config.botName || "SASAMPA-MD";                             const displayOwnerName = isOwner ? pushName || config.ownerName : config.ownerName;
                                                                                // --- AUTO HOST DETECTOR ---                                               const getHost = () => {
        const platform = os.platform();
        if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) return 'Termux';                                                                   if (process.env.HEROKU_APP_NAME) return 'Heroku';                           if (platform === 'win32') return 'Windows';
        if (platform === 'linux') return 'VPS Server';
        if (platform === 'darwin') return 'MacOS';                                  return 'Web Host';                                                      };                                                                                                                                                      // --- RUNTIME CALCULATOR ---
    const runtime = (seconds) => {
        seconds = Number(seconds);                                                  const d = Math.floor(seconds / (3600 * 24));                                const h = Math.floor(seconds % (3600 * 24) / 3600);                         const m = Math.floor(seconds % 3600 / 60);                                  const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;                                       };                                                                                                                                                      // --- AUTO PLUGIN COUNTER (PRO MAX) ---                                    const countPlugins = () => {
        try {
            const files = fs.readdirSync('./plugins');
            return files.filter(file => file.endsWith('.js')).length;               } catch (e) {
            return 0;
        }
    };

    // --- MENU ---
    if (body === prefix + 'menu' || body === prefix + 'help') {
        const host = getHost();
        const speed = "0ms";
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB";
        const plugins = countPlugins();

        const menuText = `
*╭━ 𖤍〔 ${botName.toUpperCase()}〕𖤍*
*┃ 👑 𝙾𝚆𝙽𝙴𝚁* : ${displayOwnerName}
*┃ 🕹️ 𝙿𝚁𝙴𝙵𝙸𝚇* : [ ${prefix} ]
*┃ 📟 𝙷𝙾𝚂𝚃* : ${host}
*┃ 🧩 𝙿𝙻𝚄𝙶𝙸𝙽𝚂* : ${plugins}
*┃ 🚀 𝚂𝙿𝙴𝙴𝙳* : ${speed}
*┃ 💾 𝚁𝙰𝙼* : ${ram}
*┃ ⏳𝚄𝙿𝚃𝙸𝙼𝙴* : ${runtime(process.uptime())}
*╰━⬣*
 ‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
*╭━━*〔 *AI MENU* 〕━⬣
*┃ 🤖* gpt
*┃ 🧠* deepseek
*┃ 🎨* imagine
*┃ 📚* summarize
*╰━⬣*

*╭━━*〔 *OWNER* 〕━⬣
*┃ 🛡️* restart
*┃ 🛑* shutdown
*┃ 📢* broadcast
*┃ 📸* setppbot
*┃ 📝* setname
*┃ 🚫* block
*┃ 🔓* unblock
*╰━⬣*

*╭━━*〔 *DOWNLOAD* 〕━⬣
*┃ 📥* tiktok
*┃ 📸* instagram
*┃ 📽️* video
*┃ 🎵* ytmp3
*╰━⬣*

*╭━━*〔 *GROUP* 〕━⬣
*┃ 🔗* linkgc
*┃ 💀* kick
*┃ ➕* add
*┃ 🎖️* promote
*┃ 📉* demote
*┃ 📣* tagall
*┃ 👻* hidetag
*╰━⬣*

*╭━━*〔 *FUN* 〕━⬣
*┃ 🃏* truth
*┃ 🔥* dare
*┃ 😂* joke
*┃ 🎭* meme
*┃ 📜* quote
*╰━⬣*

*╭━━*〔 *FOOTBALL* 〕━⬣
*┃ ⚽* livescore
*┃ 📅* fixtures
*┃ 📊* standings
*╰━⬣*

*╭━━*〔 *TOOLS* 〕━⬣
*┃ 🗣️* tts
*┃ 🌐* translate
*┃ 🔢* calc
*┃ ☁️* weather
*┃ 🔗* shorturl
*┃ 🖼️* sticker
*╰━⬣*

*╭━━*〔 *SETTINGS* 〕━⬣
*┃ ⚙️* mode
*┃ 💬* chatbot
*┃ 👁️* autoread
*┃ 🛡️* antidelete
*╰━⬣*

*_© ${botName} - Ultimate V90.9_*`;

        // 🔥 SEND IMAGE + MENU TEXT
        return sock.sendMessage(chat, {
            image: { url: "https://i.postimg.cc/BvVqyCrs/IMG-20260208-WA0001.jpg" },
            caption: menuText
        }, { quoted: msg });
    }

    // --- PING ---
    if (body === prefix + 'ping') {
        const start = Date.now();
        const { key } = await sock.sendMessage(
            chat,
            { text: `📡 *${botName} SYSTEM SCANNING...*` },
            { quoted: msg }
        );
        const end = Date.now();
        return sock.sendMessage(chat, {
            text: `*✅ SYSTEM STABLE*\n*🚀 Latency:* ${end - start}ms\n*💻 RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
            edit: key
        });
    }

    // --- OWNER ---
    if (body === prefix + 'owner') {
        const vcard =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${displayOwnerName}\n` +
            `ORG:${botName};\n` +
            `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber[0]}:${config.ownerNumber[0]}\n` +
            'END:VCARD';

        return sock.sendMessage(chat, {
            contacts: {
                displayName: displayOwnerName,
                contacts: [{ vcard }]
            }
        }, { quoted: msg });
    }

    // --- DEVELOPER ---
    if (body === prefix + 'developer') {
        const devNumber = config.ownerNumber[0];
        const vcardDev =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${displayOwnerName}\n` +
            `ORG:Developer of ${botName};\n` +
            `TEL;type=CELL;type=VOICE;waid=${devNumber}:${devNumber}\n` +
            'END:VCARD';

        return sock.sendMessage(chat, {
            contacts: {
                displayName: displayOwnerName,
                contacts: [{ vcard: vcardDev }]
            }
        }, { quoted: msg });
    }

    // --- RUNTIME ---
    if (body === prefix + 'runtime') {
        return sock.sendMessage(
            chat,
            { text: `*⏳ ${botName} UPTIME:* ${runtime(process.uptime())}` },
            { quoted: msg }
        );
    }

    // --- ALIVE ---
    if (body === prefix + 'alive') {
        return sock.sendMessage(
            chat,
            { text: `🔥 *${botName} IS ONLINE AND STABLE* ✅\n\n_System is running on high performance._` },
            { quoted: msg }
        );
    }
};
