module.exports = {
    name: 'reboot',
    category: 'owner',
    run: async (sock, m, { config, guard, command }) => {
        // Hakikisha ni Owner pekee na yupo Private Chat kama ulivyotaka
        if (!await guard(sock, m, command, config, { privateOnly: true })) return;

        const path = require('path');
        const fs = require('fs');
        const SECRET_FILE = path.join(__dirname, ".index.js");

        await m.reply("🚀 Nasafisha mfumo wa zamani na kupakua toleo jipya la Pro Max... Bot itazimika sekunde chache.");

        try {
            if (fs.existsSync(SECRET_FILE)) {
                fs.unlinkSync(SECRET_FILE); // Futa index ya zamani kabisa
            }
            // Zima bot (ita-restart yenyewe kama unatumia PM2 au Auto-loader ya VPS)
            setTimeout(() => { process.exit(0); }, 3000); 
        } catch (e) {
            await m.reply("❌ Hitilafu wakati wa kufuta: " + e.message);
        }
    }
};
  
