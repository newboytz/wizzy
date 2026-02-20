const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
    name: "chatbot",
    run: async (sock, m, { text, localDB, adminConfig, config, saveDB, isOwner }) => {
        try {
            // --- ⚙️ SEHEMU YA KUWASHA NA KUZIMA (OWNER ONLY) ---
            if (text.toLowerCase() === "on") {
                if (!isOwner) return m.reply("❌ Amri hii ni ya mmiliki pekee!");
                if (!localDB.settings) localDB.settings = {};
                if (!localDB.settings.chatbot) localDB.settings.chatbot = {};
                localDB.settings.chatbot.status = "on";
                saveDB();
                return m.reply("✅ Chatbot imewashwa vizuri!");
            }

            if (text.toLowerCase() === "off") {
                if (!isOwner) return m.reply("❌ Amri hii ni ya mmiliki pekee!");
                if (!localDB.settings) localDB.settings = {};
                if (!localDB.settings.chatbot) localDB.settings.chatbot = {};
                localDB.settings.chatbot.status = "off";
                saveDB();
                return m.reply("📴 Chatbot imezimwa!");
            }

            // --- 🧠 LOGIC YA KIBOTI (AI) ---
            const isChatbotOn = localDB?.settings?.chatbot?.status === "on";
            if (!isChatbotOn) return; 

            const geminiKey = adminConfig?.base_api_keys?.gemini || config.geminiKey;
            const systemPrompt = adminConfig?.ai_prompts?.chatbot_prompt || "Wewe ni AI mcheshi wa WhatsApp. Jibu kwa kifupi na kwa kiswahili.";

            if (!geminiKey) return; // Kaa kimya kama hakuna key

            if (!text || text.length < 2) return;

            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Nimeweka 1.5-flash (Ina kasi zaidi)

            await sock.sendMessage(m.key.remoteJid, { react: { text: "🧠", key: m.key } });

            const fullPrompt = `System Instructions: ${systemPrompt}\n\nUser: ${text}`;
            const result = await model.generateContent(fullPrompt);
            
            await m.reply(result.response.text());

        } catch (error) {
            console.error("❌ Chatbot Error:", error);
        }
    }
};
                
