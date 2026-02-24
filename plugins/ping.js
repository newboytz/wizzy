// ping.js
module.exports = {
    name: "ping",
    description: "Simple ping command",
    run: async (sock, m, { config, isOwner, command }) => {

        // --- 🛡️ GLOBAL PLUGIN GUARD ---
        const isPublic = config.publicCommands && config.publicCommands.includes(command);
        if (!isOwner && !isPublic) {
            console.log(`⚠️ Unauthorized attempt by ${m.key.participant || m.key.remoteJid} for ${command}`);
            await m.reply("❌ You are not allowed to run this command.");
            return; // Haiteki plugin
        }

        // --- 🚀 COMMAND LOGIC ---
        await m.reply("🏓 Pong!");
    }
};
