const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
    name: "chatbot",
    run: async (sock, m, { text, localDB, adminConfig, config }) => {
        const from = m.key.remoteJid;

        try {
            // 1. CHEKI KAMA CHATBOT IPO 'ON' KWENYE LOCAL DB (database.json)
            // Tunachungulia: db.settings.chatbot.status
            const isChatbotOn = localDB.settings?.chatbot?.status === "on";
            
            // Kama ipo OFF, plugin isifanye lolote (Silent exit)
            if (!isChatbotOn) return;

            // 2. VUTA API KEY KUTOKA MONGO (adminConfig)
            // Kama haipo Mongo, inatafuta kwenye config.js kama backup
            const geminiKey = adminConfig?.base_api_keys?.gemini || config.geminiKey;

            if (!geminiKey) {
                console.log("⚠️ Chatbot Error: Gemini API Key haijapatikana Mongo wala Config!");
                return;
            }

            // 3. VUTA SYSTEM PROMPT KUTOKA MONGO (adminConfig)
            const systemPrompt = adminConfig?.ai_prompts?.chatbot_prompt || "Wewe ni msaidizi mcheshi wa WhatsApp.";

            // 4. INALIZE GEMINI AI
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-3-flash-preview" // Model uliyotaka
            });

            // 5. REACT KUONYESHA BOT INAFANYA KAZI
            await sock.sendMessage(from, { react: { text: "🧠", key: m.key } });

            // 6. GENERATE MAJIBU
            // Tunachanganya Prompt ya Mongo na Swali la Mtumiaji
            const fullPrompt = `System Instructions: ${systemPrompt}\n\nUser: ${text}`;
            
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const replyText = response.text();

            // 7. TUMA JIBU KWA MTUMIAJI
            await sock.sendMessage(from, { 
                text: replyText 
            }, { quoted: m });

        } catch (error) {
            console.error("❌ Chatbot Plugin Error:", error.message);
            // Hapa unaweza kuchagua kukaa kimya au kutuma error message
        }
    }
};
        
