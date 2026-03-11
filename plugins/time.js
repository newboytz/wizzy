// --- COMMAND: MUDA (DM ONLY) ---
if (command === "muda" || command === "time") {
    // Tunatumia guard kuzuia isifanye kazi kwenye magrupu
    const isAllowed = await guard(sock, m, command, config, { privateOnly: true });
    
    if (isAllowed) {
        const masaa = new Date().toLocaleTimeString('sw-TZ', { timeZone: 'Africa/Nairobi' });
        const tarehe = new Date().toLocaleDateString('sw-TZ', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const timeMsg = `*⌚ MUDA NA TAREHE (DM MODE)*\n\n` +
                        `🕒 *Saa:* ${masaa}\n` +
                        `📅 *Leo:* ${tarehe}\n\n` +
                        `_Hii command inafanya kazi hapa DM tu!_`;

        await sock.sendMessage(from, { text: timeMsg }, { quoted: m });
    }
          }
