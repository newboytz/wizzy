const axios = require("axios");

module.exports = {
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System (Owner/Public check)
        if (!await guard(sock, m, command, config)) return;

        // 2. Parse arguments
        let args = text.trim().split(/ +/);
        let lang = args[0] ? args[0].toLowerCase() : null;
        let words = args.slice(1).join(' ');

        // 3. Advanced Help Message with 10 Languages & Flags
        if (!lang || lang.length !== 2 || !words) {
            let helpMsg = `😂 *STUPID ERROR!* You forgot the format.\n\n`;
            helpMsg += `🔍 *USAGE:* ${config.prefix}${command} [code] [text]\n`;
            helpMsg += `💡 *Example:* ${config.prefix}${command} en habari\n\n`;
            helpMsg += `*SUPPORTED LANGUAGES & CODES 👇*\n`;
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
            helpMsg += `_Please provide a 2-letter code first!_`;
            
            return m.reply(helpMsg);
        }

        try {
            // 4. API Call
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`);
            
            const translation = res.data[0][0][0];
            const detectedSource = res.data[2].toLowerCase();

            // Mapping language names for the direction info
            const langNames = {
                en: "English", sw: "Swahili", ar: "Arabic", fr: "French", de: "German",
                hi: "Hindi", pt: "Portuguese", es: "Spanish", ru: "Russian", zh: "Chinese"
            };

            const fromLang = langNames[detectedSource] || detectedSource.toUpperCase();
            const toLang = langNames[lang] || lang.toUpperCase();

            // 5. Final Output (Full English Pro Max)
            let response = `✨ *TRANSLATION SUCCESS*\n\n`;
            response += `${translation}\n\n`;
            response += `_${fromLang} to ${toLang}_`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            await m.reply("❌ *FATAL ERROR:* Translation failed. Ensure you used a valid 2-letter code.");
        }
    }
};
    
