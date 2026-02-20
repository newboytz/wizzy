const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config }) => {
        try {
            // 1. KUSAFISHA NAMBA YA MTUMAJI (SENDER)
            // Hii inatoa kila kitu kisicho namba (mfano @s.whatsapp.net au :1)
            const senderNumber = m.key.participant || m.key.remoteJid;
            const cleanSender = senderNumber.replace(/[^0-9]/g, ''); 

            // 2. KUHAKIKISHA NI OWNER (Inalinganisha na namba zako kwenye config.js)
            const isOwner = config.ownerNumber.includes(cleanSender);

            if (!isOwner) {
                return m.reply("❌ Amri hii ni kwa mmiliki pekee!. 😂");
            }

            // 3. PATH YA FAILI LA SYSTEM DATA
            // Inategemea bot yako imekaa vipi, mara nyingi ni hivi:
            const STORE_FILE = path.join(__dirname, "../.system_data.enc"); 

            await sock.sendMessage(m.key.remoteJid, { react: { text: "⏳", key: m.key } });

            // 4. KUFUTA CACHE
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
                console.log("✅ [SYSTEM] .system_data.enc deleted.");
            } else {
                // Kama halipo hapo juu, jaribu path nyingine ya kawaida
                const altPath = path.join(__dirname, "./.system_data.enc");
                if (fs.existsSync(altPath)) fs.unlinkSync(altPath);
            }

            let updateMsg = `*🚀 SASAMPA-MD UPDATE SYSTEM*\n\n`;
            updateMsg += `✅ *Owner Verified:* ${config.ownerName}\n`;
            updateMsg += `✅ *Cache Status:* System Data imesafishwa.\n`;
            updateMsg += `🔄 *Next Step:* Piga amri yoyote (mfano .menu) ili bot ipakue kodi mpya kutoka Cloud.\n`;

            await m.reply(updateMsg);
            await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error("❌ Update Error:", error);
            await m.reply("⚠️ Hitilafu: " + error.message);
        }
    }
};
        
