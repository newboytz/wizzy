/**
 * ⚡ KICK PRO MAX V13.9 (FINAL ULTRA EDITION)
 * Focus: Instant Admin Recognition & Smart Target Detection
 */

module.exports = {
    name: "kick",
    run: async (sock, m, { guard, config, command, text, args }) => {
        
        // --- 1. GUARD SYSTEM ---
        // Inahakikisha wewe tu (Owner) ndiye unayeweza kutoa watu na ni kwenye Group pekee
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        const chat = m.key.remoteJid;

        try {
            // --- 2. FETCH GROUP INTELLIGENCE ---
            const groupMetadata = await sock.groupMetadata(chat);
            const participants = groupMetadata.participants;

            // 🛠️ Mfumo wa kutambua ID yako (Bot) kwa usahihi 100%
            const botId = sock.user.id.includes(':') 
                          ? sock.user.id.split(':')[0] + '@s.whatsapp.net' 
                          : sock.user.id.split('@')[0] + '@s.whatsapp.net';

            // 👮 Angalia kama namba yako (Bot) ina u-admin wa kweli
            const me = participants.find(p => p.id === botId);
            const isBotAdmin = me && (me.admin === 'admin' || me.admin === 'superadmin');

            if (!isBotAdmin) {
                return sock.sendMessage(chat, { 
                    text: "⚠️ *CRITICAL ERROR:* Mimi (namba hii) sina u-admin hapa. Tafadhali nipe Admin kwanza ili nitekeleze amri!" 
                });
            }

            // --- 3. SMART TARGET IDENTIFICATION ---
            // Inatafuta mtu kwa: Tag (@), Reply (ujumbe), au Namba (.kick 2557...)
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);

            if (!target && args[0]) {
                // Kama uliandika namba, tunaiongezea @s.whatsapp.net
                let rawNumber = args[0].replace(/[^0-9]/g, '');
                if (rawNumber.length >= 10) target = rawNumber + '@s.whatsapp.net';
            }

            if (!target) {
                return m.reply("❌ *Usage:* Tag mtu, reply ujumbe wake, au andika namba yake baada ya command!");
            }

            // --- 4. EXECUTION (THE REMOVAL) ---
            await sock.groupParticipantsUpdate(chat, [target], 'remove');

            // --- 5. PRO MAX DASHBOARD ---
            const senderNumber = m.key.participant ? m.key.participant.split('@')[0] : 'Owner';
            const totalMembers = participants.length;
            
            let dashboard = `🚀 *KICK SUCCESS*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `👤 *User:* @${target.split('@')[0]}\n`;
            dashboard += `🛡️ *Action:* Instant Permanent Ban\n`;
            dashboard += `👑 *Authorized By:* @${senderNumber}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `📊 *GROUP STATS:*\n`;
            dashboard += `👥 Total Survivors: *${totalMembers - 1}*\n`;
            dashboard += `🕒 *Time:* ${new Date().toLocaleTimeString()}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `*System Status: Secured* 🛡️`;

            return sock.sendMessage(chat, {
                text: dashboard,
                mentions: [target, m.sender]
            }, { quoted: m });

        } catch (e) {
            console.log("Kick Error: ", e);
            return m.reply("❌ *CRITICAL ERROR:* Imeshindikana kumtoa. Labda ameshatoka au namba yako imepoteza u-admin ghafla.");
        }
    }
};
            
