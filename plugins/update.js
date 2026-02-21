const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config }) => {
        try {
            // 1. ULINZI: Hakikisha ni Owner pekee
            const sender = m.key.participant || m.key.remoteJid;
            const cleanSender = sender.replace(/[^0-9]/g, '');
            
            const ownerNumbers = Array.isArray(config.ownerNumber) 
                ? config.ownerNumber.map(num => num.replace(/[^0-9]/g, ''))
                : [config.ownerNumber.replace(/[^0-9]/g, '')];

            if (!ownerNumbers.includes(cleanSender)) {
                return m.reply("❌ *Access Denied:* Amri hii ni kwa ajili ya Boss pekee! 😎");
            }

            // 2. TAFUTA CACHE NA KUIFUTA
            const STORE_FILE = path.join(process.cwd(), ".system_data.enc");
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
            }

            // 3. TUMA UJUMBE WA KUAGIZIA RESTART
            let msg = `*🚀 ${config.botName.toUpperCase()} SYSTEM OVERHAUL*\n\n`;
            msg += `♻️ *Cache:* Imefutwa kikamilifu.\n`;
            msg += `🔌 *Action:* Bot inajizima na kuwaka upya...\n`;
            msg += `⏳ *Status:* Ikae tayari ndani ya sekunde 5-10.\n\n`;
            msg += `_Machine itakuwa na nguvu kinyama!_ 🔥`;

            await m.reply(msg);

            // 4. CHELEWESHA KIDOGO KISHA ZIMA BOT
            // Tunatoa sekunde 3 ili ujumbe wa WhatsApp utumike vizuri kabla process haijafa
            console.log("♻️ Restarting bot...");
            
            setTimeout(() => {
                process.exit(0); // Hii inaua bot moja kwa moja
            }, 3000);

        } catch (error) {
            console.error("❌ Update Error:", error);
            await m.reply("⚠️ Hitilafu imetokea: " + error.message);
        }
    }
};
                
