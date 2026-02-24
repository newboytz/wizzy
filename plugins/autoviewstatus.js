// plugins/autoviewstatus.js
const { guard } = require('../helpers/permission');

module.exports = {
    name: "autoviewstatus",
    description: "Toggle auto-view status on/off (default from config)",
    run: async (sock, m, { config, command, text }) => {

        if (!await guard(sock, m, command, config)) return;

        // Default value from config
        if (typeof config.autoViewStatus === 'undefined') {
            config.autoViewStatus = true;
        }

        const arg = text.toLowerCase();
        if (arg === 'on') {
            config.autoViewStatus = true;
            await m.reply("✅ Auto-View Status is now ON");
        } else if (arg === 'off') {
            config.autoViewStatus = false;
            await m.reply("❌ Auto-View Status is now OFF");
        } else {
            await m.reply(`⚙️ Current Auto-View Status: ${config.autoViewStatus ? "ON" : "OFF"}\nUse .autoviewstatus on/off to toggle`);
        }
    }
};
