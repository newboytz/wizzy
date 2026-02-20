const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config, isOwner }) => {
        try {
            // 1. KUSAFISHA NAMBA (OWNER CHECK)
            const sender = m.key.participant || m.key.remoteJid;
            const cleanSender = sender.replace(/[^0-9]/g, '');
            const isActuallyOwner = config.ownerNumber.includes(cleanSender);

            if (!isActuallyOwner) return m.reply("❌ Amri hii ni kwa mmiliki pekee!");

            // 2. PATH YA SYSTEM FILE
            const STORE_FILE = path.join(process.cwd(), ".system_data.enc");

            // 3. ACTION: FUTA CACHE KWENYE STORAGE
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE); // Futa faili kabisa
                console.log("🗑️ [CLEANUP] Storage file deleted.");
            }

            // 4. ACTION: SAFISHA RAM (pluginCache)
            // Kwenye index.js yako, pluginCache ni global. Tunasafisha yote!
            if (typeof pluginCache !== 'undefined') {
                pluginCache.clear(); 
                console.log("🧠 [CLEANUP] RAM Cache cleared.");
            }

            // 5. TUMA JIBU
            let msg = `*🚀 SASAMPA-MD LIVE UPDATE*\n\n`;
            msg += `✅ *Storage:* Futa (.system_data.enc)\n`;
            msg += `✅ *RAM:* Safi (pluginCache cleared)\n`;
            msg += `📡 *Status:* Bot sasa haina 'memory' ya kodi ya zamani. Kila amri utakayopiga sasa itatoka Cloud moja kwa moja.`;

            await m.reply(msg);

        } catch (error) {
            console.error("❌ Cleanup Error:", error);
            await m.reply("⚠️ Hitilafu wakati wa kusafisha: " + error.message);
        }
    }
};
            
