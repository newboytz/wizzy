module.exports = {
    command: "menu",
    run: async (sock, m, { userPermissions, config, localDB, text }) => {

        // require ziko ndani ili kuepuka crash
        const os = require('os');
        const fs = require('fs-extra');

        const chat = m.key.remoteJid;
        const prefix = config.prefix;
        
        // --- VARIABLES ZA MSINGI ---
        const pushName = m.pushName || "User";
        const botName = config.botName || "ULTRA-MD";
        const displayOwnerName = config.ownerName || "J_Wizzy_Tz";

        // --- AUTO HOST DETECTOR ---
        const getHost = () => {
            const platform = os.platform();
            if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) return 'Termux';
            if (process.env.HEROKU_APP_NAME) return 'Heroku';
            if (platform === 'win32') return 'Windows';
            if (platform === 'linux') return 'VPS Server';
            return 'Web Host';
        };

        // --- RUNTIME CALCULATOR ---
        const runtime = (seconds) => {
            seconds = Number(seconds);
            const d = Math.floor(seconds / (3600 * 24));
            const h = Math.floor(seconds % (3600 * 24) / 3600);
            const m = Math.floor(seconds % 3600 / 60);
            const s = Math.floor(seconds % 60);
            return `${d}d ${h}h ${m}m ${s}s`;
        };

        // --- DYNAMIC COMMAND FILTER ---
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

        const isOwner = config.ownerNumber.some(num => chat.includes(num));

        let dynamicMenu = `*╭━ 𖤍〔 ${botName.toUpperCase()}〕𖤍*
*┃ 👑 OWNER* : ${displayOwnerName}
*┃ 🕹️ PREFIX* : [ ${prefix} ]
*┃ 📟 HOST* : ${getHost()}
*┃ 🧩 PLUGINS* : ${userPermissions.length}
*┃ 💾 RAM* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
*┃ ⏳ UPTIME* : ${runtime(process.uptime())}
*╰━⬣*\n`;

        // Loop categories
        for (const [category, commands] of Object.entries(menuCategories)) {
            const filteredCmds = commands.filter(
                cmd => userPermissions.includes(cmd) || isOwner
            );

            if (filteredCmds.length > 0) {
                dynamicMenu += `\n*╭━━*〔 *${category}* 〕━⬣\n`;
                filteredCmds.forEach(cmd => {
                    dynamicMenu += `*┃ 🎖️* ${cmd}\n`;
                });
                dynamicMenu += `*╰━⬣*\n`;
            }
        }

        dynamicMenu += `\n*_© ${botName} - Ultimate V999.96_*`;

        // --- SEND MENU ---
        return sock.sendMessage(chat, {
            image: { url: "https://i.postimg.cc/BvVqyCrs/IMG-20260208-WA0001.jpg" },
            caption: dynamicMenu
        }, { quoted: m });
    }
};
