/**
 * PLUGIN: AI CHATBOT PRO MAX
 * Inatumia Gemini/OpenAI API kutoka MongoDB Admin Config
 */

const axios = require('axios');

module.exports = {
    name: "ai",
    alias: ["gpt", "chatbot"],
    run: async (sock, m, { text, config, isOwner, adminConfig, localDB, body }) => {
        
        // 1. ANGALIA KAMA NI COMMAND YA KUWASHA/ZIMA CHATBOT
        if (text.toLowerCase() === 'on') {
            if (!isOwner) return m.reply("❌ Amri hii ni kwa mmiliki pekee!");
            localDB.settings.chatbot = true;
            return m.reply("✅ Chatbot imewashwa! Sasa bot itajibu kila meseji kinyama.");
        }
        
        if (text.toLowerCase() === 'off') {
            if (!isOwner) return m.reply("❌ Amri hii ni kwa mmiliki pekee!");
            localDB.settings.chatbot = false;
            return m.reply("❌ Chatbot imezimwa! Bot itajibu amri za prefix pekee.");
        }

        // 2. LOGIC YA AI
        if (!text && !localDB.settings.chatbot) {
            return m.reply("Uliza chochote, mfano: *.ai mambo vipi?* au washa chatbot kwa *.ai on*");
        }

        // Vuta Maelezo kutoka MongoDB (Yaliyowekwa na Admin)
        const systemPrompt = adminConfig?.ai_prompts?.gemini_system || "Wewe ni msaidizi mjanja.";
        const apiKey = adminConfig?.base_api_keys?.gemini || adminConfig?.base_api_keys?.openai;
        const apiUrl = adminConfig?.api_urls?.openai_base || "https://api.openai.com/v1/chat/completions";

        if (!apiKey || apiKey === "sk-xxx") {
            return m.reply("❌ API Key haijapatikana! Weka API Key sahihi kule MongoDB AdminConfig.");
        }

        try {
            // Onyesha bot inatype...
            await sock.presenceSubscribe(m.key.remoteJid);
            await sock.sendPresenceUpdate('composing', m.key.remoteJid);

            const response = await axios.post(apiUrl, {
                model: "gpt-3.5-turbo", // Unaweza kubadili iwe gemini-pro kama API inaruhusu
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text || body }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = response.data.choices[0].message.content;
            
            // Jibu meseji
            await m.reply(result.trim());

        } catch (e) {
            console.error("AI Error:", e.response ? e.response.data : e.message);
            m.reply("⚠️ Samahani, nimepata hitilafu kwenye kuunganisha akili yangu ya AI. Hakikisha API Key na URL vipo sawa.");
        }
    }
};
