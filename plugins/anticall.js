module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System (Owner Check)
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};
        
        // 2. Set Global Flag to fix Memory Closure Bug
        if (global.isAnticallOn === undefined) {
            global.isAnticallOn = localDB.settings.anticall || false;
        }

        if (!text) return m.reply(`🤖 *ANTICALL SYSTEM*\n\nUsage:\n.anticall on - Washa\n.anticall off - Zima`);

        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            global.isAnticallOn = true; // Tunasave kwenye Global Memory
            saveDB();
            m.reply("🚫 *ANTICALL ACTIVATED:* The bot will now politely decline calls.");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            global.isAnticallOn = false;
            saveDB();
            m.reply("✅ *ANTICALL DEACTIVATED:* Calls are now allowed.");
        }

        // 3. 🧠 BAILEYS CALL ENGINE (Official Approach)
        if (!global.anticallInjected) {
            // Baileys inaleta 'callsList' kama Array (WACallEvent[])
            sock.ev.on('call', async (callsList) => {
                
                // Bot inasoma kwenye Global Memory ambayo haifutiki
                if (global.isAnticallOn) {
                    
                    // Tunapita kwenye kila tukio la simu lililoingia
                    for (const call of callsList) {
                        
                        // Tunahakikisha ni 'offer' (Mtu anapiga) na sio 'ringing' au 'reject'
                        if (call.status === 'offer') {
                            const callId = call.id;
                            const callerId = call.from; // Hii ndio Jid ya mpigaji

                            // 1. Human Delay: Tunangoja sekunde 2 WhatsApp isitu-ban
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            try {
                                // 2. Kata Simu: Method rasmi ya Baileys
                                await sock.rejectCall(callId, callerId);

                                // 3. Tuma Ujumbe (Polite Message)
                                const politeMsg = `Hello! Thank you for reaching out.\n\nI'm sorry, I am currently unable to take voice or video calls on WhatsApp at the moment. Please leave a text message here, and I will get back to you as soon as possible.\n\nThank you for your understanding! 🙏`;
                                
                                await sock.sendMessage(callerId, { text: politeMsg });
                                console.log(`[ANTICALL] Successfully rejected call from: ${callerId}`);
                                
                            } catch (err) {
                                console.log("[ANTICALL] Error rejecting call: ", err.message);
                            }
                        }
                    }
                }
            });
            
            global.anticallInjected = true;
            console.log("✅ SYSTEM UPDATE: Baileys Anticall Engine Injected!");
        }
    }
};
                
