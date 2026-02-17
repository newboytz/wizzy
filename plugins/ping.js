// ==========================================
// PLUGIN NAME: Ping
// DESCRIPTION: Inajibu 'Pong!' ikichekiwa
// ==========================================

module.exports = {
    async run(sock, m, { text, config }) {
        try {
            const from = m.key.remoteJid;
            
            // Tuma ujumbe wa kurudisha (Reply)
            await sock.sendMessage(from, { 
                text: "Pong! 🚀 Bot ipo online na inafanya kazi kwa wepesi." 
            }, { quoted: m });

        } catch (e) {
            console.error("Error in ping plugin:", e);
        }
    }
};
