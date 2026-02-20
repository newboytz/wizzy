const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config }) => {
        try {
            // 1. KUPATA NAMBA YA MTUMAJI KWA USAHIHI
            // Tunachukua m.key.participant (kwenye group) au m.key.remoteJid (DM)
            const sender = m.key.participant || m.key.remoteJid;
            
            // 2. KUSAFISHA NAMBA (Tunabakiza namba tupu tu, mfano: 255775923311)
            // Hii inatoa @s.whatsapp.net, :1, :4, n.k.
            const cleanSender = sender.replace(/[^0-9]/g, '');

            // 3. ULINZI WA MMILIKI (OWNER CHECK)
            // Tunaangalia kama namba iliyosafishwa ipo kwenye list yako ya config
            const isActuallyOwner = config.ownerNumber.includes(cleanSender);

            if (!isActuallyOwner) {
                // Kama sio owner, bot inakaa kimya au inatoa onyo fupi
                console.log(`🚫 [SECURITY] Unauthorized update attempt from: ${cleanSender}`);
                return m.reply("⚠️ *Hapana!* Amri hii ni maalum kwa Mmiliki wa bot tu.");
            }

            // --- KAMA NI OWNER, KAZI INAANZA HAPA ---

            // 4. PATH YA FAILI LA SYSTEM DATA
            const STORE_FILE = path.join(process.cwd(), ".system_data.enc");

            // 5. ACTION: FUTA CACHE KWENYE STORAGE
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
                console.log("🗑️ [CLEANUP] Storage file (.system_data.enc) deleted.");
            }

            // 6. ACTION: SAFISHA RAM (pluginCache)
            // Hii inafuta kila kitu kilichohifadhiwa kwenye RAM sasa hivi
            if (typeof pluginCache !== 'undefined') {
                pluginCache.clear(); 
                console.log("🧠 [CLEANUP] RAM Cache cleared.");
            }

            // 7. TUMA JIBU LA MAFANIKIO
            let msg = `*🚀 SASAMPA-MD MANUAL RESET*\n\n`;
            msg += `✅ *Verification:* Mmiliki ametambuliwa.\n`;
            msg += `✅ *Storage:* Faili la cache limefutwa.\n`;
            msg += `✅ *RAM:* Memory ya plugins imesafishwa.\n\n`;
            msg += `📡 *Status:* Bot ipo 'fresh'. Amri inayofuata itatoka Cloud moja kwa moja.`;

            await m.reply(msg);

        } catch (error) {
            console.error("❌ Update Error:", error);
            await m.reply("⚠️ Hitilafu: " + error.message);
        }
    }
};
        
