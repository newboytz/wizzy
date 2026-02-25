module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        if (!await guard(sock, m, command, config)) return;
        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *ANTICALL SYSTEM*\n\nUsage:\n.anticall on\n.anticall off`);

        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            return m.reply("⚡ *ANTICALL ACTIVATED:* Simu za kawaida pekee ndizo zitakatwa sasa!");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            return m.reply("✅ *ANTICALL DEACTIVATED:* Simu zimeruhusiwa.");
        }

        if (!sock.anticallInjected) {
            sock.ev.on('call', async (calls) => {
                for (const call of calls) {
                    if (localDB.settings.anticall && call.status === 'offer') {
                        
                        // 🔥 BAILYERS LOGIC FIX:
                        // Kwenye Group Voice Chat, call.from mara nyingi inakuwa ya mtu, 
                        // lakini call.chatId itakuwa ya group (@g.us).
                        // Kwenye DM Call, call.chatId inakuwa ya huyo mtu (@s.whatsapp.net).
                        
                        const isGroupCall = call.chatId && call.chatId.endsWith('@g.us');
                        const isGroupFlag = call.isGroup === true;

                        if (isGroupCall || isGroupFlag) {
                            console.log(`[IGNORE] Voice Chat in Group: ${call.chatId}`);
                            continue; // Inaruka Voice Chat ya group
                        }

                        // Sasa hapa ni DM CALL pekee
                        const callerId = call.from;
                        const callId = call.id;

                        // Kasi ya radi (Punguza hadi nusu sekunde kwa "Umeme Chapa")
                        await new Promise(resolve => setTimeout(resolve, 500));

                        try {
                            // 1. Kata Simu Rasmi
                            await sock.rejectCall(callId, callerId);

                            // 2. Mtag kwa kistaarabu
                            const ujumbe = `Hello @${callerId.split('@')[0]}! ⚡\n\nI'm sorry, I am currently unable to take direct calls. Please send a *text message* here instead. \n\n_System: Auto-Reject active_`;

                            await sock.sendMessage(callerId, { 
                                text: ujumbe, 
                                mentions: [callerId] 
                            });

                            console.log(`[REJECTED DM] From: ${callerId}`);
                        } catch (err) {
                            console.log("[ERROR REJECTING]: ", err.message);
                        }
                    }
                }
            });
            sock.anticallInjected = true;
        }
    }
};
        
