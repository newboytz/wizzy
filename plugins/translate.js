const axios = require("axios");

module.exports = {
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System (Owner/Public check)
        if (!await guard(sock, m, command, config)) return;

        // 2. Parse arguments & Check for Reply
        let args = text.trim().split(/ +/);
        let lang = args[0] ? args[0].toLowerCase() : null;
        let quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Get text from either args or replied message
        let words = args.slice(1).join(' ');
        if (!words && quotedMsg) {
            words = quotedMsg.conversation || 
                    quotedMsg.extendedTextMessage?.text || 
                    quotedMsg.imageMessage?.caption || 
                    quotedMsg.videoMessage?.caption;
        }

        // 3. Advanced Help Message (If no lang or no text found)
        if (!lang || lang.length !== 2 || !words) {
            let helpMsg = `😂 *STUPID ERROR!* Provide a language code.\n\n`;
            helpMsg += `🔍 *DIRECT:* ${config.prefix}${command} [code] [text]\n`;
            helpMsg += `🔄 *REPLY:* Reply to a message with ${config.prefix}${command} [code]\n\n`;
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
            helpMsg += `_Stable & Fast Translation System_`;
            
            return m.reply(helpMsg);
        }

        try {
            // 4. API Call with stable headers
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`);
            
            const translation = res.data[0][0][0];
            const detectedSource = res.data[2].toLowerCase();

            // Language Mapping for clean output
            const langNames = {
                en: "English", sw: "Swahili", ar: "Arabic", fr: "French", de: "German",
                hi: "Hindi", pt: "Portuguese", es: "Spanish", ru: "Russian", zh: "Chinese"
            };

            const fromLang = langNames[detectedSource] || detectedSource.toUpperCase();
            const toLang = langNames[lang] || lang.toUpperCase();

            // 5. Professional Output
            let response = `✨ *TRANSLATION SUCCESS*\n\n`;
            response += `${translation}\n\n`;
            response += `_${fromLang} to ${toLang}_`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            await m.reply("❌ *FATAL ERROR:* Translation failed. Ensure the language code is correct.");
        }
    }
};
            
