module.exports = {
    run: async (sock, m, { guard, config, command, text, isOwner }) => {
        // 1. Guard System - Must be Admin/Owner and used in Group
        const canRun = await guard(sock, m, command, config, { groupOnly: true });
        if (!canRun) return;

        const from = m.key.remoteJid;

        // 2. Check if the Bot is Admin (Bot must be admin to kick someone)
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = participants.find(p => p.id === botId)?.admin;

        if (!isBotAdmin) {
            return sock.sendMessage(from, { text: "❌ *ERROR:* I need to be an *ADMIN* to perform this action." }, { quoted: m });
        }

        // 3. Identify the target (Mentioned user or Replied message)
        let users = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (m.message.extendedTextMessage?.contextInfo?.participant) {
            users.push(m.message.extendedTextMessage.contextInfo.participant);
        }

        if (users.length === 0) {
            return sock.sendMessage(from, { text: "🔍 *USAGE:* Tag a user or reply to their message to kick them." }, { quoted: m });
        }

        const target = users[0];

        // 4. Protection: Don't kick the Owner or the Bot itself
        if (target === botId) return sock.sendMessage(from, { text: "🛡️ I cannot kick myself, sir." }, { quoted: m });
        
        // 5. Execution (The Kick)
        try {
            await sock.groupParticipantsUpdate(from, [target], "remove");
            
            await sock.sendMessage(from, { 
                text: `🚀 *SYSTEM PURGE:* User @${target.split('@')[0]} has been successfully removed from the group.`,
                mentions: [target]
            }, { quoted: m });

            console.log(`[KICK] Removed ${target} from ${from}`);

        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *FAILED:* Could not remove the user. They might be an admin or have left.` }, { quoted: m });
        }
    }
};
                                    
