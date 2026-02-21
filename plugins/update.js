const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config }) => {
        try {
            // 1. PATA NAMBA YA MTUMAJI NA ISAFISHE (Toa @s.whatsapp.net n.k)
            const sender = m.key.participant || m.key.remoteJid;
            const cleanSender = sender.replace(/[^0-9]/g, '');

            // 2. ANDAA LIST YA OWNERS KUTOKA KWENYE CONFIG
            // Tunahakikisha namba zote kwenye config nazo ni safi (namba tupu)
            const ownerNumbers = Array.isArray(config.ownerNumber) 
                ? config.ownerNumber.map(num => num.replace(/[^0-9]/g, ''))
                : [config.ownerNumber.replace(/[^0-9]/g, '')];

            // 3. CHECK KAMA NI OWNER
            const isActuallyOwner = ownerNumbers.includes(cleanSender);

            // 4. CHECK KAMA COMMAND IPO PUBLIC (Kutoka kwenye config)
            const isPublic = config.publicCommand === true;

            // LOGIC YA ULINZI:
            // Kama SIO owner NA command HAIPO public, toa onyo.
            if (!isActuallyOwner && !isPublic) {
                console.log(`🚫 [SECURITY] Unauthorized attempt from: ${cleanSender}`);
                return m.reply("⚠️ *Hapana!* You are not the owner and this command is not public.");
            }

            // --- KAMA NI OWNER (AU PUBLIC), KAZI INAENDELEA ---

            const STORE_FILE = path.join(process.cwd(), ".system_data.enc");

            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
            }

            let msg = `*🚀 ${config.botName} MANUAL RESET*\n\n`;
            msg += `✅ *Verification:* Umeruhusiwa kutumia.\n`;
            msg += `✅ *Storage:* Faili la cache limefutwa.\n`;
            msg += `📡 *Status:* Bot ipo 'fresh'.`;

            await m.reply(msg);

        } catch (error) {
            console.error("❌ Update Error:", error);
            await m.reply("⚠️ Hitilafu: " + error.message);
        }
    }
};
                                                            
