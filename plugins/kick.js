module.exports = {
    run: async (sock, m, { guard, config, command, text, isOwner }) => {
        // 1. Guard System - Inahakikisha ni Group na Sheria za Owner/Public
        const canRun = await guard(sock, m, command, config, { groupOnly: true });
        if (!canRun) return;

        const from = m.key.remoteJid;

        // 2. Tambua ID ya Bot (Namba yako unayotumia)
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // 3. Pata Metadata ya Group na kagua ma-admin
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const isBotAdmin = participants.find(p => p.id === botId)?.admin;

        // 4. Logic ya Nguvu: Kama bot (namba yako) siyo admin, basi k踢 haitafanya kazi
        if (!isBotAdmin) {
            return sock.sendMessage(from, { 
                text: "🚨 *PERMISSION DENIED:* your must be an *ADMIN* in this group to kick anyone." 
            }, { quoted: m });
        }

        // 5. Tafuta nani anapigwa kitofali (Mention au Reply)
        let users = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (m.message.extendedTextMessage?.contextInfo?.participant) {
            users.push(m.message.extendedTextMessage.contextInfo.participant);
        }

        if (users.length === 0) {
            return sock.sendMessage(from, { text: "🔍 *USAGE:* Tag a user or reply to their message to kick them." }, { quoted: m });
        }

        const target = users[0];

        // 6. Usijipige kikumbo mwenyewe (Protection)
        if (target === botId) return sock.sendMessage(from, { text: "🛡️ I cannot remove myself from the group." }, { quoted: m });
        
        // 7. Execution - Piga Machine!
        try {
            await sock.groupParticipantsUpdate(from, [target], "remove");
            
            await sock.sendMessage(from, { 
                text: `🚀 *SYSTEM PURGE:* User @${target.split('@')[0]} has been kicked out!`,
                mentions: [target]
            }, { quoted: m });

        } catch (err) {
            await sock.sendMessage(from, { text: `🚨*FAILED:* Error occurred while trying to kick the user.` }, { quoted: m });
        }
    }
};
            
