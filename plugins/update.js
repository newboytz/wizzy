const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { isOwner, config }) => {
        // 1. USALAMA: Ni owner pekee ndiye anayeweza ku-update bot
        if (!isOwner) return m.reply("❌ Amri hii ni kwa mmiliki pekee!");

        try {
            // Jina la faili la cache (Hakikisha linafanana na lile la kwenye index.js)
            const STORE_FILE = path.join(__dirname, "../.system_data.enc"); 

            // 2. TUMA REACTION KUONYESHA KAZI IMEANZA
            await sock.sendMessage(m.key.remoteJid, { react: { text: "⏳", key: m.key } });

            // 3. FUTA FAILI LA SYSTEM DATA (CACHE)
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
                console.log("✅ [SYSTEM] .system_data.enc deleted successfully.");
            }

            // 4. SAFISHA RAM CACHE (ILI ILIMISHE KUPAKUA UPYA)
            // Kumbuka: Hii itafuta kumbukumbu ya plugins zote kwenye session hii
            // (Inategemea kama index.js yako inaruhusu ku-clear pluginCache)
            
            let updateMsg = `*🚀 SASAMPA-MD UPDATE SYSTEM*\n\n`;
            updateMsg += `✅ *Cache Cleared:* Faili la mfumo limefutwa.\n`;
            updateMsg += `🔄 *Status:* Bot sasa itapakua plugins mpya kutoka Cloud.\n\n`;
            updateMsg += `_Tafadhali piga command yoyote (mfano .menu) ili kuona mabadiliko._`;

            await m.reply(updateMsg);

            // 5. REACTION YA KIMALIZIA
            await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });

            // (Optional) Unaweza kuilazimisha bot ijizime ili iwake upya (Kama unatumia PM2 au Auto-restart)
            // process.exit(0); 

        } catch (error) {
            console.error("❌ Update Error:", error);
            await m.reply("⚠️ Hitilafu imetokea wakati wa ku-update: " + error.message);
        }
    }
};
                   
