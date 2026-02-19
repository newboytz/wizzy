const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
    name: "chatbot",
    run: async (sock, m, { text, localDB, adminConfig, config }) => {
        try {
            // 1. CHUJA: KAMA IPO 'OFF' KWENYE LOCAL DB, KAA KIMYA
            const isChatbotOn = localDB?.settings?.chatbot?.status === "on";
            if (!isChatbotOn) return; 

            // 2. VUTA API KEY NA PROMPT KUTOKA MONGO (adminConfig)
            // Tunatumia optional chaining (?.) kuepuka bot ku-crash kama data haipo
            const geminiKey = adminConfig?.base_api_keys?.gemini || config.geminiKey;
            const systemPrompt = adminConfig?.ai_prompts?.chatbot_prompt || "Wewe ni AI mcheshi wa WhatsApp. Jibu kwa kifupi na kwa kiswahili.";

            if (!geminiKey) {
                return m.reply("⚠️ Boss, Gemini API Key haijapatikana kwenye Mongo wala Config!");
            }

            if (!text) return; // Kama hakuna swali, usifanye kitu

            // 3. UWASHE MTAMBO WA GEMINI
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            // 4. WEKA REACTION YA KUFIKIRIA 🧠
            await sock.sendMessage(m.key.remoteJid, { react: { text: "🧠", key: m.key } });

            // 5. TAFUTA JIBU (Unganisha Prompt + Swali)
            const fullPrompt = `System Instructions: ${systemPrompt}\n\nUser: ${text}`;
            const result = await model.generateContent(fullPrompt);
            
            // 6. TUMA JIBU KWA KUTUMIA M.REPLY YA PRO MAX 🔥
            await m.reply(result.response.text());

        } catch (error) {
            console.error("❌ Chatbot Error:", error);
            await m.reply("⚠️ Samahani, nimepata hitilafu ndogo kichwani: " + error.message);
        }
    }
};
                
