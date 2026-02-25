const axios = require("axios");

module.exports = {
    command: ["google", "gsearch"],
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System
        if (!await guard(sock, m, command, config)) return;

        if (!text) return m.reply("❌ *ERROR:* Unauliza nini? Mfano: .google nani ni Rais wa Tanzania?");

        await m.reply("🔍 *Searching Google for answers...* ⏳");

        try {
            // Tunatumia API inayoweza kusoma (scrape) maelezo ya mwanzo ya Google
            const res = await axios.get(`https://api.vreden.my.id/api/google?query=${encodeURIComponent(text)}`);
            
            // Tunachukua matokeo ya mwanzo (snippet/title)
            const result = res.data.result && res.data.result[0] ? res.data.result[0] : null;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;

            let response = `🌟 *GOOGLE SEARCH PRO MAX* 🌟\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            response += `🔍 *Query:* ${text}\n\n`;

            if (result) {
                // HAPA NDIPO MAANDISHI YANAPOKUJA
                response += `📝 *Jibu:* \n${result.snippet || result.title}\n\n`;
                response += `🔗 *Chanzo:* ${result.link}\n\n`;
            } else {
                response += `⚠️ *Samahani:* Sikuweza kupata muhtasari wa moja kwa moja. Jaribu kutumia link chini.\n\n`;
            }

            response += `━━━━━━━━━━━━━━━━━━━━\n`;
            response += `👉 *Majibu mengine:* \n${searchUrl}\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n`;
            response += `_© SASAMPA-MD - Search Engine_`;

            // Tuma ikiwa na kadi nzuri ya kuvutia
            await sock.sendMessage(m.key.remoteJid, { 
                text: response,
                contextInfo: {
                    externalAdReply: {
                        title: "GOOGLE DIRECT ANSWER",
                        body: `Majibu ya: ${text}`,
                        thumbnailUrl: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
                        sourceUrl: searchUrl,
                        mediaType: 1
                    }
                }
            }, { quoted: m });

        } catch (err) {
            // Fallback ikifeli
            await m.reply(`❌ *API ERROR:* Imeshindwa kusoma Google. Unaweza kutumia link hii: https://www.google.com/search?q=${encodeURIComponent(text)}`);
        }
    }
};
                
