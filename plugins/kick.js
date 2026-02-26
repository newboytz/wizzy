module.exports = {
    command: ["kick", "remove"],
    run: async (sock, m, { guard, config, command, text }) => {
        // 1. EXECUTE GUARD SYSTEM (Group Only Mode Activated)
        // We pass { groupOnly: true } to trigger your guard logic
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        // 2. FETCH GROUP METADATA & ADMIN STATUS
        const groupMetadata = await sock.groupMetadata(m.chat);
        const participants = groupMetadata.participants;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const isBotAdmin = participants.find(p => p.id === botId)?.admin;
        const isAdmin = participants.find(p => p.id === m.sender)?.admin;

        // Verify Bot & Sender Permissions
        if (!isBotAdmin) return m.reply("❌ *SYSTEM ERROR:* I must be an Admin to perform this action.");
        if (!isAdmin) return m.reply("❌ *ACCESS DENIED:* This command is restricted to Group Admins.");

        // 3. TARGET IDENTIFICATION (Reply, Mention, or Number)
        let users = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Add quoted user if exists
        if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            users.push(m.message.extendedTextMessage.contextInfo.participant);
        }

        // Add number from text if no mentions/reply
        if (users.length === 0 && text) {
            let cleanedNumber = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            users.push(cleanedNumber);
        }

        if (users.length === 0) {
            return m.reply("🔍 *USAGE:* Reply to a user's message or mention them using @user");
        }

        // 4. EXECUTION ENGINE (Baileys v7 Logic)
        try {
            for (let user of users) {
                // Prevent kicking the Owner or the Bot itself
                const isOwner = config.ownerNumber.some(num => user.includes(num.replace(/[^0-9]/g, '')));
                if (isOwner || user === botId) {
                    await m.reply(`⚠️ *PROTECTION:* Cannot kick Owner or Bot.`);
                    continue;
                }

                // 🔥 OFFICIAL BAILEYS v7 METHOD
                await sock.groupParticipantsUpdate(m.chat, [user], "remove");

                // 5. SUCCESS NOTIFICATION
                let successMsg = `⚡ *USER EVICTED* ⚡\n`;
                successMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
                successMsg += `👤 *Target:* @${user.split('@')[0]}\n`;
                successMsg += `📟 *Status:* Successfully Removed\n`;
                successMsg += `🛠️ *Engine:* Baileys v7 (Terminator Mode)\n`;
                successMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
                successMsg += `_© ${config.botName}_`;

                await sock.sendMessage(m.chat, { 
                    text: successMsg, 
                    mentions: [user] 
                }, { quoted: m });
            }
        } catch (err) {
            console.error("KICK ERROR:", err);
            await m.reply("❌ *FATAL ERROR:* Failed to execute removal. The user might have already left.");
        }
    }
};
            
