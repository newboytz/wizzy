module.exports = {
    name: "autotyping", // Jina la plugin
    description: "Inaonyesha 'typing...' kiotomatiki",
    run: async (sock, m, { guard, config, command }) => {
        
        // --- 🛡️ UNYAMA GUARD ---
        // Kama unataka ifanye kazi kila mahali, weka guard ya kawaida
        // Kama unataka iwe ya Owner tu, hapa ndio utachuja
        if (!await guard(sock, m, command, config)) return;

        // --- LOGIC ILIYOIBIWA ---
        const from = m.key.remoteJid;
        
        // Badala ya 'config.AUTO_TYPING', unatumia 'config' yako ya index.js
        if (config.autoTyping === 'true' || config.autoTyping === true) {
            await sock.sendPresenceUpdate('composing', from); 
        }
    }
};
