module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *ANTICALL DM-ONLY*\n\nMatumizi:\n.anticall on\n.anticall off`);

        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            return m.reply("⚡ *ANTICALL ON:* Bot itakata simu za DM tu. Voice Chat za group haziguswi!");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            return m.reply("✅ *ANTICALL OFF:* Simu zote zimeruhusiwa.");
        }

        // 3. 🧠 THE FIXED ENGINE (Anti-Group Detection)
        if (!sock.anticallInjected) {
            sock.ev.on('call', async (callsList) => {
                if (localDB.settings && localDB.settings.anticall) {
                    for (const call of callsList) {
                        const callerId = call.from;

                        // 🔥 DAWA YA GROUP VOICE CHATS:
                        // Tunatupilia mbali kama ni simu ya group (isGroup) au ID ya group (@g.us)
                        if (call.isGroup || callerId.endsWith('@g.us')) {
                            console.log(`[IGNORE] Group Voice Chat detected from: ${callerId}`);
                            continue; 
                        }

                        if (call.status === 'offer') {
                            const callId = call.id;

                            // Human Delay (Sekunde 1) kwa ajili ya Anti-Ban
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
                                
                                console.log(`[DM REJECTED] ${callerId}`);
                            } catch (err) {
                                console.log("[REJECT ERROR]: ", err.message);
                            }
                        }
                    }
                }
            });
            
            sock.anticallInjected = true;
            console.log("✅ ANTICALL: DM-Only Engine Fixed & Injected!");
        }
    }
};
        
