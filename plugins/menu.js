const os = require("os");

module.exports = {
    command: "menu",
    run: async (sock, m, { clientPerms, config, localDB, text }) => {
        try {
            const chat = m.key.remoteJid;
            
            // --- USALAMA WA VARIABLES (SAFETIES) ---
            const conf = config || {};
            const prefix = conf.prefix || ".";
            const botName = conf.botName || "ULTRA-PRO-MAX";
            const ownerName = conf.ownerName || "J_Wizzy_Tz";
            const allowedPlugins = (clientPerms && clientPerms.allowedPlugins) ? clientPerms.allowedPlugins : [];
            const ownerNumbers = Array.isArray(conf.ownerNumber) ? conf.ownerNumber : [];
            const senderNumber = m.key.participant || m.key.remoteJid;
            const isOwner = ownerNumbers.some(num => senderNumber.includes(num.replace(/[^0-9]/g, '')));

            // --- HOST DETECTOR ---
            const getHost = () => {
                const platform = os.platform();
                if (process.env && process.env.PREFIX && process.env.PREFIX.includes('com.termux')) return 'Termux';
                if (process.env && process.env.HEROKU_APP_NAME) return 'Heroku';
                return platform === 'win32' ? 'Windows' : (platform === 'linux' ? 'VPS' : 'Web');
            };

            // --- UPTIME ---
            const runtime = (sec) => {
                const d = Math.floor(sec / (3600 * 24));
                const h = Math.floor(sec % (3600 * 24) / 3600);
                const m = Math.floor(sec % 3600 / 60);
                const s = Math.floor(sec % 60);
                return `${d}d ${h}h ${m}m ${s}s`;
            };

            // --- CATEGORIES ---
            const menuCategories = {
                "AI MENU": ["gpt", "deepseek", "imagine", "summarize"],
                "OWNER": ["restart", "shutdown", "broadcast", "setppbot", "setname", "block", "unblock", "register"],
                "DOWNLOAD": ["tiktok", "instagram", "video", "ytmp3"],
                "GROUP": ["linkgc", "kick", "add", "promote", "demote", "tagall", "hidetag"],
                "FUN": ["truth", "dare", "joke", "meme", "quote"],
                "FOOTBALL": ["livescore", "fixtures", "standings"],
                "TOOLS": ["tts", "translate", "calc", "weather", "shorturl", "sticker"],
                "SETTINGS": ["mode", "chatbot", "autoread", "antidelete"]
            };

            // --- JENGA HEADER ---
            let dynamicMenu = `*╭━ 𖤍〔 ${botName.toUpperCase()}〕𖤍*\n`;
            dynamicMenu += `*┃ 👑 OWNER* : ${ownerName}\n`;
            dynamicMenu += `*┃ 🕹️ PREFIX* : [ ${prefix} ]\n`;
            dynamicMenu += `*┃ 📟 HOST* : ${getHost()}\n`;

            // HESABU PLUGINS KWA USALAMA
            let totalPlugins = 0;
            for (const cmds of Object.values(menuCategories)) {
                if (allowedPlugins.includes("all") || isOwner) {
                    totalPlugins += cmds.length;
                } else {
                    totalPlugins += cmds.filter(cmd => allowedPlugins.includes(cmd)).length;
                }
            }

            dynamicMenu += `*┃ 🧩 PLUGINS* : ${totalPlugins}\n`;
            dynamicMenu += `*┃ 💾 RAM* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\n`;
            dynamicMenu += `*┃ ⏳ UPTIME* : ${runtime(process.uptime())}\n`;
            dynamicMenu += `*╰━⬣*\n`;

            // --- LOOP CATEGORIES ---
            for (const [category, commands] of Object.entries(menuCategories)) {
                let filteredCmds = [];
                if (allowedPlugins.includes("all") || isOwner) {
                    filteredCmds = commands;
                } else {
                    filteredCmds = commands.filter(cmd => allowedPlugins.includes(cmd));
                }

                if (filteredCmds.length > 0) {
                    dynamicMenu += `\n*╭━━*〔 *${category}* 〕━⬣\n`;
                    filteredCmds.forEach(cmd => {
                        dynamicMenu += `*┃ 🎖️* ${prefix}${cmd}\n`;
                    });
                    dynamicMenu += `*╰━⬣*\n`;
                }
            }

            dynamicMenu += `\n*_© power by ${botName} - on fire_*`;

            // --- HANDLING IMAGES ---
            const images = conf.botImages;
            const hasImages = Array.isArray(images) && images.length > 0;
            const randomImage = hasImages ? images[Math.floor(Math.random() * images.length)] : null;

            if (randomImage) {
                return await sock.sendMessage(chat, { image: { url: randomImage }, caption: dynamicMenu }, { quoted: m });
            } else {
                return await sock.sendMessage(chat, { text: dynamicMenu }, { quoted: m });
            }

        } catch (error) {
            console.error("Menu Error:", error);
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Error: Menu failed to load." }, { quoted: m });
        }
    }
};
                
