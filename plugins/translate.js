const axios = require("axios");

module.exports = {
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System (Owner/Public check)
        if (!await guard(sock, m, command, config)) return;

        // 2. Parse arguments
        let args = text.trim().split(/ +/);
        let lang = args[0] ? args[0].toLowerCase() : null;
        let words = args.slice(1).join(' ');

        // 3. Logic: Kama asipoweka lugha au asipoweka maneno
        // Hapa tunakagua kama lang ni kodi ya lugha (herufi 2)
        if (!lang || lang.length !== 2 || !words) {
            let tutorial = `😂 *Wewe acha ushamba!* Hujaandika vizuri.\n\n`;
            tutorial += `❌ *Wrong:* ${config.prefix}${command} ${text || 'habari'}\n`;
            tutorial += `✅ *Example:* ${config.prefix}${command} en habari\n\n`;
            tutorial += `\`Language Codes👇 Tool\`\n`;
            tutorial += `🔹 *EN* - English\n`;
            tutorial += `🔹 *SW* - Kiswahili\n`;
            tutorial += `🔹 *AR* - Arabic\n`;
            tutorial += `🔹 *FR* - French\n`;
            tutorial += `🔹 *ZH* - Chinese\n\n`;
            tutorial += `_©2026 ${config.botName} on fire 🔥!_`;
            
            return m.reply(tutorial);
        }

        await m.reply(`🌍 *Translating to ${lang.toUpperCase()}...*`);

        try {
            // 4. API Call (Google Translate API)
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`);
            
            const translation = res.data[0][0][0];
            const detectedSource = res.data[2];

            // 5. Result Output
            let response = `✨ *TRANSLATION SUCCESS*\n\n`;
            response += `📝 *Original (${detectedSource.toUpperCase()}):* ${words}\n`;
            response += `🎯 *Result (${lang.toUpperCase()}):* ${translation}`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            await m.reply("❌ *ERROR:* Luha hiyo haipo au API imegoma. Tumia kodi kama *en, sw, fr* nk.");
        }
    }
};
    
