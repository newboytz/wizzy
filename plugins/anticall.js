module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System (Owner Check)
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *ANTICALL UMEME CHAPA*\n\nMatumizi:\n.anticall on\n.anticall off`);

        // 2. Washa/Zima
        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            return m.reply("⚡ *UMEME CHAPA ACTIVATED:* Bot itakata simu kwa kasi ya radi na ku-tag watu!");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            return m.reply("✅ *ANTICALL DEACTIVATED:* Simu zimeruhusiwa.");
        }

        // 3. 🧠 UMEME CHAPA ENGINE (Fast & Tagging)
        if (!sock.anticallInjected) {
            sock.ev.on('call', async (callsList) => {
                
                if (localDB.settings && localDB.settings.anticall) {
                    for (const call of callsList) {
                        if (call.status === 'offer') {
                            const callId = call.id;
                            const callerId = call.from;

                            // Kasi ya Umeme (Tunapunguza delay iwe sekunde 1 tu)
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            try {
                                // 1. Kata Simu Papo Hapo
                                await sock.rejectCall(callId, callerId);

                                // 2. Pata jina la mpigaji
                                const contact = await sock.getName(callerId) || 'User';

                                // 3. Ujumbe wa Kistalabu na Kum-Tag (@mention)
                                const ujumbe = `Hello @${callerId.split('@')[0]}! ⚡\n\nI'm sorry, I am currently unable to receive calls. Please leave a *text message* here and I will respond as soon as possible.\n\n_System: Auto-Reject active_`;

                                await sock.sendMessage(callerId, { 
                                    text: ujumbe, 
                                    mentions: [callerId] 
                                });
                                
                                console.log(`[UMEME CHAPA] Rejected & Tagged: ${callerId}`);
                            } catch (err) {
                                console.log("[ANTICALL ERROR]: ", err.message);
                            }
                        }
                    }
                }
            });
            
            sock.anticallInjected = true;
            console.log("⚡ UMEME CHAPA: Engine Injected Successfully!");
        }
    }
};
            
