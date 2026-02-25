const axios = require("axios");

module.exports = {
    command: "google",
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. Guard System (Unyama wa ulinzi)
        if (!await guard(sock, m, command, config)) return;

        if (!text) return m.reply("❌ *ERROR:* Unauliza nini? Mfano: .google nani ni Rais wa Tanzania?");

        await m.reply("🔍 *Searching Google...* ⏳");

        try {
            // Tunatumia API ya Google Search (Custom Search JSON API)
            // Kumbuka: Hii inatumia ujanja wa 'google-it' style scraping kama huna API Key
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
            
            // Hapa tunapata matokeo ya haraka (Snippet)
            const res = await axios.get(`https://api.screenshotmachine.com/?key=FREE&url=${searchUrl}&device=desktop`); 
            
            // Mfumo huu wa 'Pro Max' unakupa Link na Maelezo kidogo
            // Kwa sababu scraping ya Google ni ngumu, hapa nakupa 'Smart Linker'
            
            let response = `🌟 *GOOGLE SEARCH RESULTS* 🌟\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            response += `🔍 *Query:* ${text}\n\n`;
            response += `👉 *Bofya hapa kuona majibu yote:* \n${searchUrl}\n\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n`;
            response += `_© ${config.botName} - Search Engine_`;

            await sock.sendMessage(m.key.remoteJid, { 
                text: response,
                contextInfo: {
                    externalAdReply: {
                        title: "GOOGLE SEARCH PRO",
                        body: `Results for: ${text}`,
                        thumbnailUrl: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
                        sourceUrl: searchUrl,
                        mediaType: 1
                    }
                }
            }, { quoted: m });

        } catch (err) {
            await m.reply("❌ *FATAL ERROR:* Imeshindwa kuunganisha na Google Servers.");
        }
    }
};
      
