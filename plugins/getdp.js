module.exports = {
    name: "getdp",
    aliases: ["gtdp", "pfp"],
    description: "Fetches user profile picture instantly",
    run: async (sock, m, { guard, config, command, text }) => {
        
        // 1. --- 🛡️ GUARD CHECK ---
        if (!await guard(sock, m, command, config, { active: true })) return;

        try {
            // 2. --- QUICK TARGET IDENTIFIER ---
            // Priority: Mentioned (@user) > Quoted (Reply) > Sender (Self)
            let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
            
            const botName = config.botName || "QB BOT";
            const targetNumber = target.split('@')[0];

            // 3. --- FETCH DP WITH FALLBACK ---
            let ppUrl;
            try {
                // Tunavuta High Resolution Image ('image')
                ppUrl = await sock.profilePictureUrl(target, 'image');
            } catch (err) {
                // Kama DP imefichwa au haipo, tunatuma picha ya placeholder chap
                ppUrl = 'https://telegra.ph/file/241fb40590a3a41a4a49c.jpg';
            }

            // 4. --- PREPARE CAPTION ---
            let caption = `🚀 *${botName.toUpperCase()} INSTANT PFP* 🚀\n\n`;
            caption += `👤 *User:* @${targetNumber}\n`;
            caption += `✨ *Status:* Fetched Successfully\n\n`;
            caption += `*🛡️ Powered by ${botName}*`;

            // 5. --- SEND IMAGE IMMEDIATELY ---
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: ppUrl },
                caption: caption,
                mentions: [target]
            }, { quoted: m });

        } catch (e) {
            console.log(`❌ DP Error: ${e.message}`);
            // Kama ikishindikana kabisa, bot inakupa taarifa
            await sock.sendMessage(m.key.remoteJid, { 
                text: `🚀 *${config.botName}:* User DP is private or not found.` 
            }, { quoted: m });
        }
    }
};
