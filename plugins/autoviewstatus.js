module.exports = {
    command: ["autostatus", "statusview"],
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {
        // 1. Guard System (Owner Only)
        if (!await guard(sock, m, command, config)) return;

        if (!localDB.settings) localDB.settings = {};

        if (!text) return m.reply(`🤖 *AUTO-STATUS SYSTEM*\n\nUsage:\n.autostatus on - Enable\n.autostatus off - Disable`);

        // 2. Toggle Settings
        if (text.toLowerCase() === "on") {
            localDB.settings.autostatus = true;
            saveDB();
            m.reply("🟢 *AUTO-STATUS VIEW:* Successfully Activated! The bot will now view all statuses automatically.");
        } else if (text.toLowerCase() === "off") {
            localDB.settings.autostatus = false;
            saveDB();
            m.reply("🔴 *AUTO-STATUS VIEW:* Deactivated. The bot will no longer view statuses.");
        }

        // 3. 🧠 BAILEYS v7 STATUS ENGINE (Global Injection)
        if (!sock.statusInjected) {
            sock.ev.on('messages.upsert', async ({ messages }) => {
                const msg = messages[0];
                
                // Filter: Check if the message is from 'status@broadcast'
                if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                    
                    // Check if Auto-Status is enabled in Database
                    if (localDB.settings && localDB.settings.autostatus) {
                        try {
                            // 🔥 OFFICIAL BAILEYS v7 METHOD: Mark message as read
                            // This sends the 'viewed' receipt to the status poster
                            await sock.readMessages([msg.key]);

                            const sender = msg.key.participant || msg.key.remoteJid;
                            console.log(`✨ [STATUS VIEWED] Successfully viewed status from: ${sender}`);

                            // Optional: Send a reaction to the status (e.g., ❤️)
                            // await sock.sendMessage('status@broadcast', { react: { text: '❤️', key: msg.key } }, { statusJidList: [sender] });

                        } catch (err) {
                            console.error("❌ STATUS VIEW ERROR:", err.message);
                        }
                    }
                }
            });

            sock.statusInjected = true;
            console.log("✅ STATUS ENGINE: Baileys v7 Auto-View Injected!");
        }
    }
};
                    
