const axios = require("axios");

module.exports = {
    command: "google",
    run: async (sock, m, { guard, config, command, text }) => {
        if (!await guard(sock, m, command, config)) return;
        if (!text) return m.reply("❌ *ERROR:* Unauliza nini? Mfano: .google nani ni Rais wa Tanzania?");

        await m.reply("🔍 *Searching Google for direct answers...* ⏳");

        try {
            // Tunatumia API mbadala inayoweza kutoa snippets moja kwa moja
            const searchUrl = `https://api.screenshotmachine.com/?key=FREE&url=https://www.google.com/search?q=${encodeURIComponent(text)}`;
            const googleLink = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
            
            // Hapa tunatumia Search Engine Scraper (Inachukua muda kidogo lakini inaleta data)
            const res = await axios.get(`https://google-search-api.vercel.app/api/search?q=${encodeURIComponent(text)}`);
            const result = res.data.results[0]; // Tunachukua jibu la kwanza kabisa

            let response = `🌟 *GOOGLE SEARCH RESULTS* 🌟\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            response += `🔍 *Query:* ${text}\n\n`;
            
            if (result) {
                response += `📝 *Top Answer:* \n${result.description}\n\n`;
                response += `🔗 *Source:* ${result.link}\n\n`;
            } else {
                response += `⚠️ *Samahani:* Sikuweza kupata muhtasari wa haraka, tafadhali tumia link hapa chini.\n\n`;
            }

            response += `━━━━━━━━━━━━━━━━━━━━\n`;
            response += `👉 *Majibu mengine:* \n${googleLink}\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n`;
            response += `_© ${config.botName}- Search 🤳_`;

            await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

        } catch (err) {
            // Fallback kama API imegoma (Inaleta link kama ilivyokuwa mwanzo)
            let fallback = `🌟 *GOOGLE SEARCH (LINK ONLY)* 🌟\n\n`;
            fallback += `🔍 *Query:* ${text}\n\n`;
            fallback += `👉 *Bofya hapa:* https://www.google.com/search?q=${encodeURIComponent(text)}`;
            await m.reply(fallback);
        }
    }
};
                                                                                     
