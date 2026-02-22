// autoviewstatus.js
module.exports = {
    run: async (sock, m, { config, localDB, saveDB }) => {
        try {
            // 1. ANGALIA KAMA FEATURE IMEWASHWA KWENYE DATABASE
            // Tunatumia path hii kwenye JSON: db.settings.autoview.status
            if (!localDB.settings) localDB.settings = {};
            if (!localDB.settings.autoview) {
                localDB.settings.autoview = { status: "on", count: 0, viewed_ids: [] };
                saveDB();
            }

            // Kama ipo "off", plugin inaishia hapa
            if (localDB.settings.autoview.status === "off") return;

            const statusJid = m.key.remoteJid;
            const participant = m.key.participant;
            const statusId = m.key.id;

            // 2. KUKAGUA KUMBUKUMBU (Zuia kurudia status ile ile)
            if (localDB.settings.autoview.viewed_ids.includes(statusId)) return;

            // --- LOGIC A: VIEW STATUS ---
            await sock.readMessages([{
                remoteJid: statusJid,
                id: statusId,
                participant: participant 
            }]);

            // --- LOGIC B: BLUE TICK (Presence) ---
            await sock.sendPresenceUpdate('composing', statusJid); 

            // --- LOGIC C: REACT (Emoji) ---
            if (config.status_react_emojis && Array.isArray(config.status_react_emojis)) {
                const emojis = config.status_react_emojis;
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                await sock.sendMessage(statusJid, { 
                    react: { text: randomEmoji, key: m.key } 
                }, { statusJidList: [participant] });
            }

            // 3. TUNZA KUMBUKUMBU KWENYE database.json
            localDB.settings.autoview.count += 1; // Ongeza idadi ya status zilizoonekana
            localDB.settings.autoview.viewed_ids.push(statusId); // Hifadhi ID kuzuia marudio
            
            // Limit kumbukumbu zisizidi 100 ili file lisikuwe sana
            if (localDB.settings.autoview.viewed_ids.length > 100) {
                localDB.settings.autoview.viewed_ids.shift();
            }
            
            saveDB(); // Hifadhi mabadiliko kwenye database.json

            console.log(`\x1b[32m✅ [DB SAVED] Status viewed for: ${m.pushName || 'User'} (Total: ${localDB.settings.autoview.count})\x1b[0m`);

        } catch (e) {
            console.log("Error in autoviewstatus plugin:", e.message);
        }
    }
};
                
