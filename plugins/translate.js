const axios = require("axios");

module.exports = {
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System (Owner/Public check)
        if (!await guard(sock, m, command, config)) return;

        // 2. Parse arguments: .translate [lugha] [maneno]
        let [lang, ...query] = text.split(' ');
        let words = query.join(' ');

        if (!lang || !words) {
            return m.reply(`🔍 *USAGE:* ${config.prefix}${command} [iso-code] [text]\n\nExample: *${config.prefix}${command} sw Hello world*`);
        }

        await m.reply(`🌍 *Translating to ${lang.toUpperCase()}...*`);

        try {
            // 3. API Call (Google Translate API via free mirror)
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`);
            
            const translation = res.data[0][0][0];
            const detectedSource = res.data[2];

            // 4. Result Output
            let response = `✨ *TRANSLATION SUCCESS*\n\n`;
            response += `📝 *Original (${detectedSource}):* ${words}\n`;
            response += `🎯 *Result (${lang}):* ${translation}`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            console.log("Translation Error:", err.message);
            await m.reply("❌ *ERROR:* Failed to connect to translation server. Check if the language code is correct (e.g., sw, en, fr, ar).");
        }
    }
};
    
