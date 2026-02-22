const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config }) => {
        try {
            // 1. PATA NAMBA YA MTUMAJI NA ISAFISHE
            const sender = m.key.participant || m.key.remoteJid;
            const cleanSender = sender.replace(/[^0-9]/g, '');

            // 2. ANDAA LIST YA OWNERS
            const ownerNumbers = Array.isArray(config.ownerNumber) 
                ? config.ownerNumber.map(num => num.replace(/[^0-9]/g, ''))
                : [config.ownerNumber.replace(/[^0-9]/g, '')];

            // 3. ULINZI WA KIJASUSI
            const isActuallyOwner = ownerNumbers.includes(cleanSender);
            if (!isActuallyOwner) {
                return m.reply("🚫 *Unauthorized:* Command hii ni kwa ajili ya Owner pekee.");
            }

            // --- KAZI YA USAFISHI INAANZA ---

            // A. FUTA RAM (Kumbukumbu ya sasa ya bot)
            if (global.pluginCache) {
                global.pluginCache.clear();
            }

            // B. FUTA LOCAL STORE (Orodha ya kodi zilizohifadhiwa)
            if (global.localStore) {
                global.localStore = {};
            }

            // C. FUTA FAILİ LA CACHE KWENYE STORAGE (.enc)
            const STORE_FILE = path.join(process.cwd(), ".system_data.enc");
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
            }

            // 4. ANDAA UJUMBE WA MAFANIKIO
            let msg = `*🚀 ${config.botName.toUpperCase()} HOT-RELOAD*\n\n`;
            msg += `🧹 *RAM:* Imesafishwa (Cache Cleared)\n`;
            msg += `🗑️ *Storage:* Faili la .enc limefutwa\n`;
            msg += `✨ *Action:* Bot sasa itapakua plugins mpya kutoka Vercel pindi tu utapoandika command.\n\n`;
            msg += `📡 *Status:* Bot ipo safi kabisa!`;

            await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });

        } catch (error) {
            console.error("❌ Update Error:", error);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Hitilafu: " + error.message }, { quoted: m });
        }
    }
};
