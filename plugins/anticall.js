module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *ANTICALL DM-ONLY*\n\nUsage:\n.anticall on\n.anticall off`);

        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            return m.reply("⚡ *UMEME CHAPA ACTIVATED:* Bot itakata simu za DM tu, magroup hayaguswi!");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            return m.reply("✅ *ANTICALL DEACTIVATED:* Simu zimeruhusiwa.");
        }

        // 3. 🧠 DM-ONLY ENGINE
        if (!sock.anticallInjected) {
            sock.ev.on('call', async (callsList) => {
                if (localDB.settings && localDB.settings.anticall) {
                    for (const call of callsList) {
                        const callerId = call.from;

                        // 🔥 TIBA YA GROUP: Kama simu inatoka kwenye group (@g.us), iache ipite
                        if (callerId.endsWith('@g.us')) continue;

                        if (call.status === 'offer') {
                            const callId = call.id;

                            // Kasi ya Umeme (Sekunde 1)
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            try {
                                // 1. Kata Simu
                                await sock.rejectCall(callId, callerId);

                                // 2. Ujumbe wa kistaarabu + Mentions
                                const ujumbe = `Hello @${callerId.split('@')[0]}! ⚡\n\nI'm sorry, I do not receive direct calls on this number. Please leave a *text message* here.\n\n_System: Auto-Reject active (DM Only)_`;

                                await sock.sendMessage(callerId, { 
                                    text: ujumbe, 
                                    mentions: [callerId] 
                                });
                                
                                console.log(`[DM REJECT] Rejected: ${callerId}`);
                            } catch (err) {
                                console.log("[ANTICALL ERROR]: ", err.message);
                            }
                        }
                    }
                }
            });
            
            sock.anticallInjected = true;
            console.log("⚡ UMEME CHAPA: DM-Only Engine Injected!");
        }
    }
};
        
