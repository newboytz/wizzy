module.exports = {
    command: ["kick", "remove"],
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. GUARD SYSTEM (Group Only Mode)
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        const chatJid = m.key.remoteJid;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        try {
            // 2. FETCH GROUP DATA
            const groupMetadata = await sock.groupMetadata(chatJid);
            const participants = groupMetadata.participants;

            // Check Permissions
            const isBotAdmin = participants.find(p => p.id === botId)?.admin;
            const senderId = m.key.participant || m.key.remoteJid;
            const isAdmin = participants.find(p => p.id === senderId)?.admin;

            if (!isBotAdmin) return m.reply("❌ *SYSTEM ERROR:* Bot requires Admin privileges to kick.");
            if (!isAdmin) return m.reply("❌ *ACCESS DENIED:* Only group admins can use this command.");

            // 3. TARGET EXTRACTION
            let users = [];
            
            // Check for Mentions
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                users = m.message.extendedTextMessage.contextInfo.mentionedJid;
            } 
            // Check for Quoted Message
            else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
                users.push(m.message.extendedTextMessage.contextInfo.participant);
            } 
            // Check for Manual Number input
            else if (text) {
                let cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length > 5) users.push(`${cleaned}@s.whatsapp.net`);
            }

            if (users.length === 0) return m.reply("🔍 *USAGE:* Mention someone, reply to their message, or type their number.");

            // 4. EXECUTION ENGINE
            for (let user of users) {
                // Security Check (Protect Owner & Bot)
                const isOwner = config.ownerNumber.some(num => user.includes(num.replace(/[^0-9]/g, '')));
                if (isOwner || user === botId) {
                    await m.reply(`⚠️ *PROTECTION:* Target @${user.split('@')[0]} is protected.`);
                    continue;
                }

                // 🔥 BAILEYS v7 TERMINATOR METHOD
                await sock.groupParticipantsUpdate(chatJid, [user], "remove");

                // 5. SUCCESS NOTIFICATION
                let response = `⚡ *KICK EXECUTED* ⚡\n`;
                response += `━━━━━━━━━━━━━━━━━━━━\n`;
                response += `👤 *User:* @${user.split('@')[0]}\n`;
                response += `📟 *Status:* Successfully Removed\n`;
                response += `🛠️ *Engine:* Baileys v7 PRO MAX\n`;
                response += `━━━━━━━━━━━━━━━━━━━━\n`;
                response += `_© ${config.botName}_`;

                await sock.sendMessage(chatJid, { 
                    text: response, 
                    mentions: [user] 
                }, { quoted: m });
            }

        } catch (err) {
            console.error("KICK ERROR:", err);
            await m.reply("❌ *FATAL ERROR:* Failed to fetch group metadata or remove user. Ensure the bot is admin.");
        }
    }
};
            
