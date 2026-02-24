module.exports = {
    name: "ping",
    description: "Ping command example",
    run: async (sock, m, { config, command, guard }) => { // <--- Hakikisha 'guard' ipo hapa

        // Sasa hapa 'guard' itafanya kazi bila Error ya Forbidden
        if (!await guard(sock, m, command, config)) return;

        await m.reply("🏓 Pong!");
    }
};
