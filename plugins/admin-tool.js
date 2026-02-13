const axios = require('axios');

module.exports = {
    command: "addpro", // Matumizi: .addpro 255712345678
    isOwner: true,    
    run: async (sock, m, { text, args }) => {
        const targetUser = args[0];

        if (!targetUser) {
            return sock.sendMessage(m.key.remoteJid, { 
                text: "❌ *Unasahau kitu!*\nMatumizi: `.addpro 255xxxxxxxxx`" 
            });
        }

        try {
            const response = await axios.post("https://plugins-bot.vercel.app/api/register", {
                adminKey: "YAKO_SIRI_123", // Hakikisha hii inafanana na ya Vercel
                clientId: targetUser,
                data: {
                    plan: "Lifetime Pro",
                    status: "active",
                    plugins: ["all"], // Inampa ruhusa ya kila kitu
                    registeredAt: new Date().toLocaleString()
                }
            });

            if (response.data.status) {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: `✅ *USAJILI KAKAMILIKA!*\n\n👤 ID: ${targetUser}\n🚀 Plan: Lifetime (Unlimited)\n🛡️ Hali: Active` 
                });
            }
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: "❌ API imegoma. Hakikisha umei-deploy register.js kule Vercel." });
        }
    }
};
              
