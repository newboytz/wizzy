module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System (Unyama wa ulinzi)
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};
        
        if (!text) return m.reply(`🤖 *ANTICALL SYSTEM*\n\nUsage:\n.anticall on - To activate\n.anticall off - To deactivate`);

        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            return m.reply("🚫 *ANTICALL ACTIVATED:* The bot will now politely decline calls.");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            return m.reply("✅ *ANTICALL DEACTIVATED:* Calls are now allowed.");
        }

        // --- 🧠 HUMAN-SENSE ENGINE (ANTI-BAN) ---
        sock.ev.on('call', async (callEvent) => {
            const call = callEvent[0];
            if (localDB.settings.anticall && call.status === 'offer') {
                const { id: callId, from: callerId } = call;

                // 1. Tunangoja sekunde 2 ili isionekane ni roboti (Human Delay)
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 2. Kata Simu
                await sock.rejectCall(callId, callerId);

                // 3. Tuma Ujumbe wa Kistaarabu (Polite Human Message)
                const politeMsg = `Hello! Thank you for reaching out. \n\nI'm sorry, I am currently unable to take voice calls on WhatsApp at the moment. Please leave a text message here, and I will get back to you as soon as possible. \n\nThank you for your understanding! 🙏`;

                await sock.sendMessage(callerId, { text: politeMsg });

                console.log(`[ANTICALL] Humanly rejected call from: ${callerId}`);
            }
        });
    }
};
          
