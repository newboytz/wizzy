module.exports = {
    name: "time",
    description: "Inaonyesha saa na tarehe (DM Only)",
    run: async (sock, m, { guard, config, command }) => {
        
        // --- 🛡️ GUARD SYSTEM ---
        // Tunaiambia guard itumie 'privateOnly: true'
        // Hii inahakikisha command haifanyi kazi kwenye magrupu
        if (!await guard(sock, m, command, config, { privateOnly: true })) return;

        // --- TIME LOGIC (Tanzania/East Africa) ---
        const options = { timeZone: 'Africa/Nairobi', hour12: true };
        const saa = new Date().toLocaleTimeString('sw-TZ', options);
        const tarehe = new Date().toLocaleDateString('sw-TZ', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        // --- SALAMU KULINGANA NA MUDA ---
        const hour = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Nairobi"})).getHours();
        let salamu = "Habari!";
        if (hour < 12) salamu = "Habari ya Asubuhi 🌅";
        else if (hour < 16) salamu = "Habari ya Mchana ☀️";
        else if (hour < 21) salamu = "Habari ya Jioni 🌆";
        else salamu = "Usiku Mwema 🌙";

        // --- UJUMBE WA KUTUMA ---
        const timeMsg = `
*${salamu}*

⌚ *Muda:* ${saa}
📅 *Tarehe:* ${tarehe}
🌍 *Eneo:* Afrika Mashariki (EAT)

_Hii command imefungwa kufanya kazi DM pekee._`.trim();

        // Kutuma ujumbe
        await sock.sendMessage(m.key.remoteJid, { 
            text: timeMsg 
        }, { quoted: m });
    }
};
                         
