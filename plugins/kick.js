/**
 * ⚡ KICK PRO MAX V13.9 (FINAL ULTRA EDITION)
 * Focus: High-Speed Instant Removal & Smart Admin Detection
 */

module.exports = {
    name: "kick",
    run: async (sock, m, { guard, config, command, text, args }) => {
        
        // --- 1. GUARD SYSTEM ---
        // Inahakikisha Owner tu ndiye anatoa amri na ni ndani ya Group pekee
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        const chat = m.key.remoteJid;

        try {
            // --- 2. FETCH GROUP INTELLIGENCE ---
            const groupMetadata = await sock.groupMetadata(chat);
            const participants = groupMetadata.participants;

            // 🛠️ FIX YA KIMATAIFA: Inasafisha ID ya Bot (Namba yako)
            // Hii inakata vitu kama ':1' au ':45' ili ibaki namba tupu @s.whatsapp.net
            const botId = sock.user.id.includes(':') 
                          ? sock.user.id.split(':')[0] + '@s.whatsapp.net' 
                          : sock.user.id.split('@')[0] + '@s.whatsapp.net';

            // 👮 KUKAGUA U-ADMIN: Inatafuta namba yako kwenye orodha ya Admins
            const me = participants.find(p => p.id === botId);
            const isBotAdmin = me && (me.admin === 'admin' || me.admin === 'superadmin');

            if (!isBotAdmin) {
                return sock.sendMessage(chat, { 
                    text: "⚠️ *ACCESS DENIED:* Mimi (namba hii) sina u-admin hapa. Niweke Admin kwanza ndipo nitaweza kutoa watu!" 
                });
            }

            // --- 3. SMART TARGET IDENTIFICATION ---
            // Inadaka mlengwa kwa: Tag (@), Reply (ujumbe), au Namba (.kick 2557...)
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);

            if (!target && args[0]) {
                let rawNumber = args[0].replace(/[^0-9]/g, '');
                if (rawNumber.length >= 10) target = rawNumber + '@s.whatsapp.net';
            }

            if (!target) {
                return m.reply("❌ *Usage:* Tag mtu, reply ujumbe wake, au andika namba yake!");
            }

            // --- 4. EXECUTION (THE BOOT) ---
            await sock.groupParticipantsUpdate(chat, [target], 'remove');

            // --- 5. PRO MAX DASHBOARD ---
            const senderNumber = m.key.participant ? m.key.participant.split('@')[0] : 'Owner';
            const totalMembers = participants.length;
            
            let dashboard = `🚀 *KICK PRO MAX V13.9: SUCCESS*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `👤 *Target:* @${target.split('@')[0]}\n`;
            dashboard += `🛡️ *Action:* Instant Permanent Removal\n`;
            dashboard += `👑 *Authorized By:* @${senderNumber}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `📊 *GROUP UPDATES:*\n`;
            dashboard += `👥 Total Remaining: *${totalMembers - 1}*\n`;
            dashboard += `🕒 *Time:* ${new Date().toLocaleTimeString()}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `*System Status: Secured* 🛡️`;

            return sock.sendMessage(chat, {
                text: dashboard,
                mentions: [target, m.sender]
            }, { quoted: m });

        } catch (e) {
            console.log("Kick Error: ", e);
            return m.reply("❌ *CRITICAL ERROR:* Imeshindikana! Hakikisha huyo mtu bado yupo group na mimi nina u-admin wa kweli.");
        }
    }
};
