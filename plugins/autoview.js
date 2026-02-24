module.exports = {
    name: "autoviewstatus",
    description: "Inasoma status automatic na inaruhusu on/off",
    run: async (sock, m, { guard, config, command, text, localDB, saveDB }) => {

        // 1. Pata remoteJid
        const from = m.key.remoteJid;

        // --- SEHEMU YA A: LOGIC YA AUTOMATIC (Inapopata Status) ---
        if (from === "status@broadcast") {
            // Angalia kama mpangilio upo 'true' kwenye database au config
            const statusEnabled = localDB.settings?.autoViewStatus ?? config.autoViewStatus;

            if (statusEnabled === true) {
                try {
                    await sock.readMessages([m.key]);
                    console.log(`\x1b[32m👁️  [AUTO-VIEW] Status viewed: ${m.pushName || 'User'}\x1b[0m`);
                } catch (e) {
                    // Ignore errors
                }
            }
            return; // Maliza hapa kama ni status
        }

        // --- SEHEMU YA B: LOGIC YA COMMAND (Inapoandikwa .autoviewstatus on/off) ---
        // Cheki ulinzi (Owner pekee)
        if (!await guard(sock, m, command, config)) return;

        if (!text) {
            const hiviSasa = (localDB.settings?.autoViewStatus ?? config.autoViewStatus) ? "ON ✅" : "OFF ❌";
            return m.reply(`*AUTO-VIEW STATUS*\n\nStatus ya sasa: *${hiviSasa}*\n\nTumia hivi:\n*.${command} on* - Kuwasha\n*.${command} off* - Kuzima`);
        }

        const input = text.toLowerCase().trim();

        if (input === "on") {
            if (!localDB.settings) localDB.settings = {}; // Hakikisha settings object ipo
            localDB.settings.autoViewStatus = true;
            saveDB(); // Hifadhi kwenye database.json
            await m.reply("✅ *Auto-View Status* imewashwa!");
        } 
        else if (input === "off") {
            if (!localDB.settings) localDB.settings = {};
            localDB.settings.autoViewStatus = false;
            saveDB(); // Hifadhi kwenye database.json
            await m.reply("❌ *Auto-View Status* imezimwa!");
        } 
        else {
            await m.reply("Tafadhali tumia 'on' au 'off'.");
        }
    }
};
        
