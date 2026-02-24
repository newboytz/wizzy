const { guard } = require('../helpers/permission');

module.exports = {
    name: "ping",
    description: "Ping command example",
    run: async (sock, m, { config, command }) => {

        // --- 🛡️ CHECK PERMISSION ---
        if (!await guard(sock, m, command, config)) return;

        // --- 🚀 LOGIC YA PLUGIN ---
        await m.reply("🏓 Pong!");
    }
};
