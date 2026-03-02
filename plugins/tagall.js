module.exports = {
    name: "tagall",
    description: "Mentions all members with a clean aesthetic",
    run: async (sock, m, { guard, config, command, text }) => {
        
        // 1. --- 🛡️ GUARD CHECK ---
        // Ensure it only runs in groups and only by admins (optional)
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        try {
            // 2. --- GET DATA ---
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const participants = groupMetadata.participants;
            const botName = config.botName || "QB BOT";
            const groupName = groupMetadata.subject;

            // 3. --- PREPARE MESSAGE CONTENT ---
            let userMsg = text ? text : 'No specific message provided.';
            
            // Clean & Professional Header
            let tagMsg = `🚀 *${botName.toUpperCase()} MULTI-TAG* 🚀\n\n`;
            tagMsg += `📌 *Group:* ${groupName}\n`;
            tagMsg += `📝 *Message:* ${userMsg}\n`;
            tagMsg += `👥 *Total Members:* ${participants.length}\n\n`;
            tagMsg += `--- *MEMBER LIST* ---\n\n`;

            let mentions = [];
            let list = "";

            // 4. --- MENTIONS LOOP (THE ROCKET STYLE) ---
            for (let mem of participants) {
                // Formatting: 🚀 @123456789
                list += `🚀 @${mem.id.split('@')[0]}\n`;
                mentions.push(mem.id);
            }

            tagMsg += list;
            tagMsg += `\n\n*🛡️ Powered by ${botName} System*`;

            // 5. --- SEND MESSAGE ---
            await sock.sendMessage(m.key.remoteJid, {
                text: tagMsg,
                mentions: mentions
            }, { quoted: m });

        } catch (err) {
            console.log(`❌ TagAll Error: ${err.message}`);
            // Optional: send error to group
            // await sock.sendMessage(m.key.remoteJid, { text: `System Error: ${err.message}` });
        }
    }
};
                                                    
