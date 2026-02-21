module.exports = {
    command: "autoview",
    
    // 1. SEHEMU YA COMMAND (Kuwasha na Kuzima)
    run: async (sock, m, { text, config, isOwner, localDB, saveDB }) => {
        if (!isOwner) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Owner pekee." }, { quoted: m });
        }

        if (!localDB.settings) localDB.settings = {};
        if (!localDB.settings.autoview) localDB.settings.autoview = { status: "off" };

        const args = text ? text.toLowerCase().trim() : "";

        if (args === "on") {
            localDB.settings.autoview.status = "on";
            saveDB();
            return sock.sendMessage(m.key.remoteJid, { text: "✅ *Auto View Status* imewashwa (ON)." }, { quoted: m });
        } else if (args === "off") {
            localDB.settings.autoview.status = "off";
            saveDB();
            return sock.sendMessage(m.key.remoteJid, { text: "✅ *Auto View Status* imezimwa (OFF)." }, { quoted: m });
        } else {
            return sock.sendMessage(m.key.remoteJid, { text: `*MATUMIZI:* \n${config.prefix}autoview on\n${config.prefix}autoview off` }, { quoted: m });
        }
    },

    // 2. SEHEMU YA BACKGROUND (Kusoma status zenyewe zikiingia)
    autoExec: async (sock, m, { localDB, rc }) => {
        try {
            // Angalia kama ipo ON kwenye database
            const status = localDB?.settings?.autoview?.status || "off";
            
            if (status === "on" && m.key.remoteJid === "status@broadcast") {
                await sock.readMessages([{
                    remoteJid: m.key.remoteJid,
                    id: m.key.id,
                    participant: m.key.participant
                }]);
                
                // Tunatumia rangi (rc) kama uliipitisha, au console ya kawaida
                console.log(`👁️ Status Viewed: ${m.pushName || 'User'}`);
            }
        } catch (e) {
            console.log("⚠️ Autoview Error:", e.message);
        }
    }
};
  
