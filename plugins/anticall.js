module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        if (!await guard(sock, m, command, config)) return;
        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *ANTICALL SYSTEM*\n\nUsage:\n.anticall on\n.anticall off`);

        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            return m.reply("⚡ *ANTICALL ACTIVATED:* Simu za DM sasa zitakatwa kinyama!");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            return m.reply("✅ *ANTICALL DEACTIVATED:* Simu zimeruhusiwa.");
        }

        if (!sock.anticallInjected) {
            sock.ev.on('call', async (calls) => {
                // Tunahakikisha mpangilio wa Anti-Call umewashwa kwenye Database
                if (localDB.settings && localDB.settings.anticall) {
                    for (const call of calls) {
                        if (call.status === 'offer') {
                            
                            // 1. CHUJA VOICE CHAT ZA GROUP (Muhimu!)
                            // Kama chatId ina @g.us, hii ni Voice Chat ya group, IPOTEZEE.
                            if (call.chatId && call.chatId.endsWith('@g.us')) continue;

                            const callId = call.id;
                            const callerId = call.from;

                            // 2. KASI YA UMEME (Nusu Sekunde)
                            await new Promise(resolve => setTimeout(resolve, 500));

                            try {
                                // 🔥 DAWA: Tunatuma signal ya "reject" kwa kutumia callId na from
                                // Baileys v6+ inahitaji vitu hivi viwili hivi hivi
                                await sock.rejectCall(callId, callerId);

                                // 3. Ujumbe wa kistaarabu + Kum-tag (Mention)
                                const pushName = call.pushName || "User";
                                const politeMsg = `Hello @${callerId.split('@')[0]}! ⚡\n\nI am currently unable to take voice/video calls. Please leave a *text message* here, and I will get back to you soon.\n\n_System: Auto-Reject active (DM Only)_`;

                                await sock.sendMessage(callerId, { 
                                    text: politeMsg,
                                    mentions: [callerId]
                                });

                                console.log(`[REJECTED] Call from ${pushName} (${callerId})`);
                            } catch (err) {
                                console.log("❌ REJECT ERROR:", err.message);
                            }
                        }
                    }
                }
            });
            sock.anticallInjected = true;
            console.log("✅ ANTICALL: Umeme Chapa Engine Injected!");
        }
    }
};
            
