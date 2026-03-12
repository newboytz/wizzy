const fs = require('fs');
const path = require('path');

module.exports = {
    name: "autotyping",
    description: "Smart Auto-Typing with Toggle & Auto-Correction",
    async run(sock, m, { guard, config, command, args, localDB }) {
        
        const from = m.key.remoteJid;

        // 1️⃣ [GLOBAL LOGIC] - Hii sehemu inaprosesi kila ujumbe
        // Inacheki kama switch ipo ON na kama ujumbe hautoki kwako
        if (localDB.settings?.autoTyping && !m.key.fromMe && from !== 'status@broadcast') {
            await sock.sendPresenceUpdate('composing', from);
        }

        // 2️⃣ [COMMAND LOGIC] - Inafanya kazi tu ukipiga command
        if (command === "autotyping") {
            // Ulinzi wa Owner pekee
            if (!await guard(sock, m, command, config)) return;

            const input = args[0] ? args[0].toLowerCase() : null;

            // Smart Correction
            if (input && !['on', 'off'].includes(input)) {
                let suggest = input.includes('o') ? "on" : "off";
                return await sock.sendMessage(from, { 
                    text: `❌ *English Correction:* \n\nInvalid setting! Did you mean *${config.prefix}${command} ${suggest}*?` 
                }, { quoted: m });
            }

            // Toggle Logic
            if (!localDB.settings) localDB.settings = {};
            localDB.settings.autoTyping = input ? (input === 'on') : !localDB.settings.autoTyping;

            // Save to Database
            const DB_PATH = path.join(__dirname, "../database.json");
            fs.writeFileSync(DB_PATH, JSON.stringify(localDB, null, 2));

            const status = localDB.settings.autoTyping ? "ENABLED ✅" : "DISABLED ❌";
            await sock.sendMessage(from, { 
                text: `*AUTO-TYPING SYSTEM*\n\nStatus: *${status}*\nFeedback: Mode has been updated successfully.` 
            }, { quoted: m });
        }
    }
};
            
