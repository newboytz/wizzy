module.exports = {
    name: "kick",
    run: async (sock, m, { guard, config, command }) => {

        const canRun = await guard(sock, m, command, config, { groupOnly: true });
        if (!canRun) return;

        const from = m.key.remoteJid;

        // 🔥 CLEAN BOT ID (v7 safe without jidDecode)
        const botId = sock.user.id.split("@")[0].split(":")[0] + "@s.whatsapp.net";

        // 🔥 CLEAN SENDER ID
        const senderRaw = m.key.participant || m.key.remoteJid;
        const sender = senderRaw.split("@")[0].split(":")[0] + "@s.whatsapp.net";

        // 📦 GET GROUP DATA
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;

        // 👑 CHECK ADMIN STATUS
        const isBotAdmin = participants.some(p => p.id === botId && p.admin !== null);
        const isSenderAdmin = participants.some(p => p.id === sender && p.admin !== null);

        if (!isSenderAdmin) {
            return sock.sendMessage(from, {
                text: "❌ PERMISSION DENIED: You must be ADMIN."
            }, { quoted: m });
        }

        if (!isBotAdmin) {
            return sock.sendMessage(from, {
                text: "❌ BOT must be ADMIN in this group."
            }, { quoted: m });
        }

        // 🎯 GET TARGET (mention or reply)
        let users = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            users.push(m.message.extendedTextMessage.contextInfo.participant);
        }

        if (users.length === 0) {
            return sock.sendMessage(from, {
                text: "🔍 Tag user or reply to their message."
            }, { quoted: m });
        }

        let target = users[0];
        target = target.split("@")[0].split(":")[0] + "@s.whatsapp.net";

        // 🛡️ PROTECTION SYSTEM
        if (target === botId) {
            return sock.sendMessage(from, {
                text: "🛡️ I can't remove myself."
            }, { quoted: m });
        }

        if (config.ownerNumber?.includes(target.split("@")[0])) {
            return sock.sendMessage(from, {
                text: "👑 I can't remove my owner."
            }, { quoted: m });
        }

        // 🚀 EXECUTE KICK
        try {
            await sock.groupParticipantsUpdate(from, [target], "remove");

            await sock.sendMessage(from, {
                text: `🚀 User @${target.split("@")[0]} has been kicked!`,
                mentions: [target]
            }, { quoted: m });

        } catch (err) {
            await sock.sendMessage(from, {
                text: "❌ FAILED: Unable to kick user."
            }, { quoted: m });
        }
    }
};
