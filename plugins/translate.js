const axios = require("axios");

module.exports = {
    command: "translate",
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System
        if (!await guard(sock, m, command, config)) return;

        // 2. Identify the content
        let quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        let args = text.trim().split(/ +/);
        let lang = args[0] ? args[0].toLowerCase() : null;
        
        let words = "";
        if (quoted) {
            words = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || quoted.videoMessage?.caption || "";
        } else {
            words = args.slice(1).join(' ');
        }

        // 3. Help Message (Kama vigezo havijatimia)
        if (!lang || lang.length !== 2 || !words) {
            let helpMsg = `😂 *STUPID ERROR!* Hukufuata utaratibu.\n\n`;
            helpMsg += `🔍 *DIRECT:* ${config.prefix}${command} sw Hello\n`;
            helpMsg += `📩 *REPLY:* Reply ujumbe kisha andika ${config.prefix}${command} sw\n\n`;
            helpMsg += `_Tumia kodi za lugha kama: en, sw, ar, fr, de, hi, es, ru_`;
            return m.reply(helpMsg);
        }

        try {
            // 4. API Call - Google Translate (gtx)
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`);
            
            // 🔥 TIBA YA KUKATA MANENO: Tunaunganisha vipande vyote vya array
            const translation = res.data[0].map(item => item[0]).join(""); 
            
            const detectedSource = res.data[2].toLowerCase();

            // Flags & Names Mapping
            const langData = {
                en: { name: "English", flag: "🇺🇸" },
                sw: { name: "Swahili", flag: "🇹🇿" },
                ar: { name: "Arabic", flag: "🇸🇦" },
                fr: { name: "French", flag: "🇫🇷" },
                de: { name: "German", flag: "🇩🇪" },
                hi: { name: "Hindi", flag: "🇮🇳" },
                es: { name: "Spanish", flag: "🇪🇸" },
                pt: { name: "Portuguese", flag: "🇵🇹" },
                ru: { name: "Russian", flag: "🇷🇺" },
                zh: { name: "Chinese", flag: "🇨🇳" }
            };

            const from = langData[detectedSource] || { name: detectedSource.toUpperCase(), flag: "🌐" };
            const to = langData[lang] || { name: lang.toUpperCase(), flag: "🏁" };

            // 5. Final Output
            let response = `✨ *TRANSLATION SUCCESS* ✨\n`;
            response += `━━━━━━━━━━━━━━━━━━\n\n`;
            response += `${translation}\n\n`;
            response += `━━━━━━━━━━━━━━━━━━\n`;
            response += `${from.flag} *${from.name}* ➔  ${to.flag} *${to.name}*`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            await m.reply("❌ *API ERROR:* Imegoma kufasiri, huenda urefu wa maneno umezidi au API ina msongamano.");
        }
    }
};
                    
