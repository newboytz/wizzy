const fs = require('fs');
const path = require('path');

module.exports = {
    name: "update",
    run: async (sock, m, { config }) => {
        try {
            // 1️⃣ Kusafisha namba ya mtumiaji (Group + Private + Linked devices)
            const senderJid = m.key.participant || m.key.remoteJid;
            const senderNumber = senderJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');

            // 2️⃣ Owner check
            const ownerNumbers = (config.ownerNumber || []).map(v => v.replace(/[^0-9]/g, ''));
            const isOwner = ownerNumbers.includes(senderNumber);

            // 3️⃣ Public command check
            const publicCommands = config.publicCommands || [];
            const isPublicCommand = publicCommands.includes("update"); // Hii ni plugin name

            // 4️⃣ Block if not owner AND not public command
            if (!isownerNumber && !isPublicCommand) {
                return m.reply("🔒 Hii command ni ya Owner tu. Wewe huna access 😞");
            }

            // 5️⃣ Path ya faili la system data
            const STORE_FILE = path.join(__dirname, "../.system_data.enc");

            await sock.sendMessage(m.key.remoteJid, { react: { text: "⏳", key: m.key } });

            // 6️⃣ Kufuta cache
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
                console.log("✅ [SYSTEM] .system_data.enc deleted.");
            } else {
                const altPath = path.join(__dirname, "./.system_data.enc");
                if (fs.existsSync(altPath)) fs.unlinkSync(altPath);
            }

            // 7️⃣ Prepare message
            let updateMsg = `*🚀 SASAMPA-MD UPDATE SYSTEM*\n\n`;
            updateMsg += `✅ *Owner Verified:* ${config.ownerName}\n`;
            updateMsg += `✅ *Cache Status:* System Data imesafishwa.\n`;
            updateMsg += `🔄 *Next Step:* Piga amri yoyote (mfano .menu) ili bot ipakue kodi mpya kutoka Cloud.\n`;

            // 8️⃣ Send message & reaction
            await m.reply(updateMsg);
            await sock.sendMessage(m.key.remoteJid, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error("❌ Update Error:", error);
            await m.reply("⚠️ Hitilafu: " + error.message);
        }
    }
};
