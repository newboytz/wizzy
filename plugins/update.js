module.exports = {
    run: async (sock, m, { guard, config, command, pluginCache, localStore, STORE_FILE, fs }) => {
        // Guard sasa hivi inahakikisha ni Owner na lazima iwe DM (Inbox)
        const canRun = await guard(sock, m, command, config, { dmOnly: true });
        if (!canRun) return;

        try {
            await sock.sendMessage(m.key.remoteJid, { text: "🔄 *SYSTEM UPDATE:* Nafuta RAM na Cache ya plugins..." }, { quoted: m });

            // 1. Futa kila kitu kilichopo kwenye RAM (pluginCache)
            pluginCache.clear();
            console.log("RAM Cache Cleared!");

            // 2. Safisha lile object la localStore
            for (let key in localStore) {
                delete localStore[key];
            }

            // 3. Futa file la siri (.system_data.enc) kabisa
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
                console.log("Storage File Deleted!");
            }

            // Success Message
            await sock.sendMessage(m.key.remoteJid, { 
                text: "✅ *REFRESHED SUCCESS!*\n\nRAM 0." 
            }, { quoted: m });

        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: `❌ Hitilafu wakati wa ku-update: ${err.message}` }, { quoted: m });
        }
    }
};
                
