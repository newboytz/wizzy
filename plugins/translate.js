const axios = require("axios");

module.exports = {
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System (Owner/Public check)
        if (!await guard(sock, m, command, config)) return;

        // 2. Identify the content (Reply or Direct Text)
        let quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        let args = text.trim().split(/ +/);
        let lang = args[0] ? args[0].toLowerCase() : null;
        
        // Logic ya kupata maneno: Kama kuna reply, chukua ya reply. Kama hamna, chukua args.
        let words = "";
        if (quoted) {
            words = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || quoted.videoMessage?.caption || "";
        } else {
            words = args.slice(1).join(' ');
        }

        // 3. Advanced Help Message (Kama vigezo havijatimia)
        if (!lang || lang.length !== 2 || !words) {
            let helpMsg = `😂 *STUPID ERROR!* You forgot the format.\n\n`;
            helpMsg += `🔍 *DIRECT:* ${config.prefix}${command} [code] [text]\n`;
            helpMsg += `📩 *REPLY:* Reply to a message with ${config.prefix}${command} [code]\n\n`;
            helpMsg += `*SUPPORTED LANGUAGES & FLAGS 👇*\n`;
            helpMsg += `🇺🇸 *EN* - English\n`;
            helpMsg += `🇹🇿 *SW* - Swahili\n`;
            helpMsg += `🇸🇦 *AR* - Arabic\n`;
            helpMsg += `🇫🇷 *FR* - French\n`;
            helpMsg += `🇩🇪 *DE* - German\n`;
            helpMsg += `🇮🇳 *HI* - Hindi\n`;
            helpMsg += `🇵🇹 *PT* - Portuguese\n`;
            helpMsg += `🇪🇸 *ES* - Spanish\n`;
            helpMsg += `🇷🇺 *RU* - Russian\n`;
            helpMsg += `🇨🇳 *ZH* - Chinese\n\n`;
            helpMsg += `_©2026 *${config.botName}* on fire 🔥!_`;
            
            return m.reply(helpMsg);
        }

        try {
            // 4. API Call
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`);
            
            const translation = res.data[0][0][0];
            const detectedSource = res.data[2].toLowerCase();

            // Mapping language names
            const langNames = {
                en: "English", sw: "Swahili", ar: "Arabic", fr: "French", de: "German",
                hi: "Hindi", pt: "Portuguese", es: "Spanish", ru: "Russian", zh: "Chinese"
            };

            const fromLang = langNames[detectedSource] || detectedSource.toUpperCase();
            const toLang = langNames[lang] || lang.toUpperCase();

            // 5. Final Pro Max Output
            let response = `✨ *TRANSLATION SUCCESS*\n\n`;
            response += `${translation}\n\n`;
            response += `_${fromLang} to ${toLang}_`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            await m.reply("❌ *FATAL ERROR:* Translation failed. API might be busy or invalid code used.");
        }
    }
};
            
