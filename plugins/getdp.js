module.exports = {
    name: "getdp",
    aliases: ["gtdp", "pfp"],
    description: "Fetches profile picture via mention or reply",
    run: async (sock, m, { guard, config, command, text }) => {
        
        // 1. --- 🛡️ GUARD CHECK ---
        if (!await guard(sock, m, command, config, { active: true })) return;

        try {
            // 2. --- SMART TARGET DETECTION ---
            // 1st Priority: Mentioned user (@juna)
            // 2nd Priority: Quoted message (Reply)
            // 3rd Priority: The sender themselves
            let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;

            const botName = config.botName || "QB BOT";
            const targetNumber = target.split('@')[0];

            // 3. --- FETCH PROFILE PICTURE ---
            let ppUrl;
            try {
                // Fetching high-quality 'image'
                ppUrl = await sock.profilePictureUrl(target, 'image');
            } catch (e) {
                // Fallback if DP is hidden or doesn't exist
                ppUrl = 'https://telegra.ph/file/241fb40590a3a41a4a49c.jpg'; 
            }

            // 4. --- PREPARE CAPTION ---
            let caption = `🚀 *${botName.toUpperCase()} PFP RETRIEVED* 🚀\n\n`;
            caption += `👤 *User:* @${targetNumber}\n`;
            caption += `✨ *Status:* Successfully fetched\n\n`;
            caption += `*🛡️ Powered by ${botName} System*`;

            // 5. --- SEND IMAGE ---
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: ppUrl },
                caption: caption,
                mentions: [target]
            }, { quoted: m });

        } catch (err) {
            console.log(`❌ GetDP Error: ${err.message}`);
            await sock.sendMessage(m.key.remoteJid, { 
                text: `🚀 *${config.botName}:* Unable to fetch profile picture.` 
            }, { quoted: m });
        }
    }
};
                         
