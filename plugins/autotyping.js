const fs = require('fs');
const path = require('path');

module.exports = {
    name: "autotyping",
    description: "Toggle auto-typing status with smart correction",
    run: async (sock, m, { guard, config, command, args, localDB }) => {
        
        // --- 🛡️ GUARD SYSTEM ---
        if (!await guard(sock, m, command, config)) return;

        const from = m.key.remoteJid;
        const input = args[0] ? args[0].toLowerCase() : null;

        // --- 🧠 SMART CORRECTION LOGIC ---
        // Kama mtumiaji ameandika kitu tofauti na 'on' au 'off'
        const validInputs = ['on', 'off'];
        if (input && !validInputs.includes(input)) {
            // Hapa bot inamkosoa mtumiaji
            let correction = input.includes('o') ? "on" : "off"; 
            return await sock.sendMessage(from, { 
                text: `❌ *Invalid Input!* \n\nDid you mean *${config.prefix}${command} ${correction}*?\nUse only *on* or *off*.` 
            }, { quoted: m });
        }

        // --- 🔄 TOGGLE LOGIC ---
        if (!localDB.settings) localDB.settings = {};

        if (!input) {
            // Kama ameandika command pekee, inageuza (Toggle)
            localDB.settings.autoTyping = !localDB.settings.autoTyping;
        } else {
            // Kama amespecify (mfano: .autotyping on)
            localDB.settings.autoTyping = (input === 'on');
        }

        // --- 💾 DATABASE AUTO-SAVE ---
        // Hii inahakikisha index haifanyi kazi ya kusave
        const DB_PATH = path.join(__dirname, "../database.json");
        fs.writeFileSync(DB_PATH, JSON.stringify(localDB, null, 2));

        // --- 📝 RESPONSE ---
        const status = localDB.settings.autoTyping ? "ENABLED ✅" : "DISABLED ❌";
        
        const responseMsg = `*━─┈❮ AUTO-TYPING SYSTEM ❯┈─━*\n\n` +
                            `Status: *${status}*\n` +
                            `Mode: *Smart Toggle*\n\n` +
                            `_The bot will now ${localDB.settings.autoTyping ? 'show' : 'stop showing'} typing status._`;

        await sock.sendMessage(from, { text: responseMsg }, { quoted: m });
    }
};
                
