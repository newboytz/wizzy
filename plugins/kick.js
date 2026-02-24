module.exports = {
    name: "kick",
    run: async (sock, m, { guard, config, command, text, args }) => {
        
        // --- 1. GUARD SYSTEM (Hapa ndipo tunatumia guard yako) ---
        // Inahakikisha hii command inatumika kwenye Group pekee na na Owner
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        const chat = m.key.remoteJid;

        try {
            // --- 2. FETCH GROUP DATA ---
            const groupMetadata = await sock.groupMetadata(chat);
            const participants = groupMetadata.participants;
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = participants.find(p => p.id === botId)?.admin !== null;

            if (!isBotAdmin) {
                return sock.sendMessage(chat, { text: "⚠️ *ACCESS DENIED:* Bot must be an Admin!" });
            }

            // --- 3. TARGET IDENTIFICATION ---
            // Inatumia mfumo wako wa kwanza au m.quoted
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);

            if (!target && args[0]) {
                target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!target) return m.reply("❌ Please mention a user or reply to their message!");

            // --- 4. EXECUTION ---
            await sock.groupParticipantsUpdate(chat, [target], 'remove');

            // --- 5. PRO MAX DASHBOARD ---
            const senderNumber = m.key.participant ? m.key.participant.split('@')[0] : 'Owner';
            let dashboard = `🚀 *KICK PRO MAX V13.9: SUCCESS*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `👤 *User:* @${target.split('@')[0]}\n`;
            dashboard += `🛡️ *Action:* Instant Removal\n`;
            dashboard += `👑 *Authorized By:* @${senderNumber}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `*System Status: Secured* 🛡️`;

            return sock.sendMessage(chat, {
                text: dashboard,
                mentions: [target, m.sender]
            }, { quoted: m });

        } catch (e) {
            console.log("Kick Error: ", e);
            return m.reply("❌ *ERROR:* User already left or Bot lacks permission.");
        }
    }
};
    
