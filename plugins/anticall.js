module.exports = {
    command: ["anticall", "autoreject"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};
        
        if (!text) return m.reply(`🤖 *ANTICALL SYSTEM*\n\nUsage:\n.anticall on - Washa\n.anticall off - Zima`);

        // 2. Washa au Zima
        if (text.toLowerCase() === "on") {
            localDB.settings.anticall = true;
            saveDB();
            m.reply("🚫 *ANTICALL ACTIVATED:* The bot will now politely decline calls.");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.anticall = false;
            saveDB();
            m.reply("✅ *ANTICALL DEACTIVATED:* Calls are now allowed.");
        }

        // 3. 🧠 GLOBAL INJECTION ENGINE (Hapa ndio uchawi ulipo)
        // Tunaiambia bot isikilize simu masaa 24, hata kama hujatuma meseji.
        // Tunatumia 'global' kuzuia isijipachike mara mbili mbili.
        if (!global.anticallInjected) {
            sock.ev.on('call', async (callEvents) => {
                const call = callEvents[0];
                
                // Inaangalia kwenye Database kama Anti-Call ipo 'ON'
                if (localDB.settings?.anticall && call.status === 'offer') {
                    const callId = call.id;
                    const callerId = call.from;

                    // 1. Human Delay (Inasubiri sekunde 2 ili WhatsApp isijue ni bot)
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    try {
                        // 2. Kata Simu ✂️
                        await sock.rejectCall(callId, callerId);

                        // 3. Tuma Ujumbe wa Kistaarabu (Polite Anti-Ban Message)
                        const politeMsg = `Hello! Thank you for reaching out. \n\nI'm sorry, I am currently unable to take voice or video calls on WhatsApp at the moment. Please leave a text message here, and I will get back to you as soon as possible. \n\nThank you for your understanding! 🙏`;
                        
                        await sock.sendMessage(callerId, { text: politeMsg });
                        console.log(`[ANTICALL] Successfully rejected call from: ${callerId}`);
                    } catch (err) {
                        console.log("[ANTICALL] Error rejecting call: ", err.message);
                    }
                }
            });
            
            global.anticallInjected = true;
            console.log("✅ SYSTEM UPDATE: Global Anticall Engine Injected Successfully!");
        }
    }
};
        
