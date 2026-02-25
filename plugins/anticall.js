module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System (Owner Check)
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *ANTICALL SYSTEM*\n\nUsage:\n.anticall on - Washa\n.anticall off - Zima`);

        // 2. Washa au Zima (Tunatumia localDB kwa usalama wa kutosha)
        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            m.reply("🚫 *ANTICALL ACTIVATED:* The bot will now politely decline calls.");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            m.reply("✅ *ANTICALL DEACTIVATED:* Calls are now allowed.");
        }

        // 3. 🧠 BAILEYS CALL ENGINE (VM-COMPATIBLE)
        // Tunatumia 'sock' yenyewe badala ya 'global' kuzuia 'is not defined'
        if (!sock.anticallInjected) {
            sock.ev.on('call', async (callsList) => {
                
                // Bot inasoma hali ya anticall kutoka kwenye localDB kila simu inapoingia
                if (localDB.settings && localDB.settings.anticall) {
                    
                    for (const call of callsList) {
                        if (call.status === 'offer') {
                            const callId = call.id;
                            const callerId = call.from;

                            // Human Delay ya sekunde 2 (Anti-Ban)
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            try {
                                // Kata Simu
                                await sock.rejectCall(callId, callerId);

                                // Ujumbe wa kistaarabu
                                const politeMsg = `Hello! Thank you for reaching out.\n\nI'm sorry, I am currently unable to take voice or video calls on WhatsApp at the moment. Please leave a text message here, and I will get back to you as soon as possible.\n\nThank you for your understanding! 🙏`;
                                
                                await sock.sendMessage(callerId, { text: politeMsg });
                                console.log(`[ANTICALL] Call rejected from: ${callerId}`);
                                
                            } catch (err) {
                                console.log("[ANTICALL] Reject Error: ", err.message);
                            }
                        }
                    }
                }
            });
            
            sock.anticallInjected = true; 
            console.log("✅ SYSTEM UPDATE: Anticall Engine Injected into Sock!");
        }
    }
};
            
