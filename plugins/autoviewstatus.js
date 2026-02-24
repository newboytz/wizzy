const { guard } = require('../helpers/permission');

module.exports = {
    name: "autoviewstatus",
    description: "Toggle auto-view status ON/OFF (default from config)",
    run: async (sock, m, { config, command, text }) => {

        if (!await guard(sock, m, command, config)) return;

        // Ensure default
        if (typeof config.autoViewStatus === 'undefined') {
            config.autoViewStatus = true;
        }

        const arg = text.trim().toLowerCase();
        if (arg === 'on') {
            config.autoViewStatus = true;
            await m.reply("✅ Auto-View Status is now ON");
        } else if (arg === 'off') {
            config.autoViewStatus = false;
            await m.reply("❌ Auto-View Status is now OFF");
        } else {
            await m.reply(`⚙️ Current Auto-View Status: ${config.autoViewStatus ? "ON" : "OFF"}\nUse .autoviewstatus on/off to toggle`);
        }
    },

    // ✅ This function runs automatically in bot core
    init: (sock, config) => {
        if (!config.autoViewStatus) return;

        sock.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                if (!m.message) return;
                // Status broadcasts are sent as remoteJid === "status@broadcast"
                if (!m.key.fromMe && m.key.remoteJid === "status@broadcast") {
                    if (config.autoViewStatus) {
                        await sock.sendReadReceipt(m.key.remoteJid, m.key.participant, [m.key.id]);
                        console.log(`👁️ Status from ${m.key.participant.split("@")[0]} auto-viewed`);
                    }
                }
            } catch (e) {
                console.log("⚠️ Auto-View Error:", e.message);
            }
        });
    }
};
