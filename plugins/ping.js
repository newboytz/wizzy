module.exports = {
    name: "ping",
    description: "To check bot speed and status",
    run: async (sock, m, { guard, config, command }) => {
        
        // --- 🛡️ UNYAMA MODE: Permission Check ---
        // Inatumia 'guard' inayotoka kwenye index.js yako moja kwa moja
        if (!await guard(sock, m, command, config)) return;

        const start = Date.now();
        
        // Tunatuma ujumbe wa kwanza
        const { key } = await sock.sendMessage(m.key.remoteJid, { 
            text: "Testing speed..." 
        }, { quoted: m });

        const end = Date.now();
        const pingTime = end - start;

        // Tunafanya 'Edit' kwenye ule ujumbe wa kwanza kuonyesha matokeo
        await sock.sendMessage(m.key.remoteJid, { 
            text: `🏓 *Pong!* \n\n🚀 Speed: *${pingTime}ms*\n🤖 Status: *Online*`,
            edit: key 
        });
    }
};
