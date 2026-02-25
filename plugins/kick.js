/**
 * ⚡ KICK PRO MAX V14.0 (SUPREME OWNER EDITION)
 * Focus: Ultimate Authority, High-Speed Removal & Anti-Fail Detection
 */

module.exports = {
    name: "kick",
    run: async (sock, m, { guard, config, command, text, args }) => {
        
        // --- 1. GUARD SYSTEM (THE GATES) ---
        // Inahakikisha wewe kama Owner au Admin ndiye unatoa amri.
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        const chat = m.key.remoteJid;

        try {
            // --- 2. FETCH GROUP INTELLIGENCE (UPDATED METADATA) ---
            // Tunachukua data za kisasa kabisa za kundi ili kuepuka cache za zamani
            const groupMetadata = await sock.groupMetadata(chat);
            const participants = groupMetadata.participants;

            // 🛠️ THE ULTIMATE JID FIX: Kusafisha ID ya Bot na Sender (Wewe)
            const botId = sock.user.id.includes(':') 
                          ? sock.user.id.split(':')[0] + '@s.whatsapp.net' 
                          : sock.user.id.split('@')[0] + '@s.whatsapp.net';
                          
            const senderId = m.sender || m.key.participant;

            // 👮 KUKAGUA U-ADMIN WA BOT 
            const botParticipant = participants.find(p => p.id === botId);
            const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');

            if (!isBotAdmin) {
                return sock.sendMessage(chat, { 
                    text: "⚠️ *SYSTEM HALTED:* Mimi (Bot) sina u-admin kwenye hili kundi. Nipandishe cheo kwanza nitumie mamlaka yangu!" 
                });
            }

            // --- 3. SMART TARGET IDENTIFICATION ---
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);

            if (!target && args[0]) {
                let rawNumber = args[0].replace(/[^0-9]/g, '');
                if (rawNumber.length >= 10) target = rawNumber + '@s.whatsapp.net';
            }

            if (!target) {
                return m.reply("❌ *Usage Error:* Onyesha mlengwa (Tag, Reply, au Namba)!");
            }

            // --- 4. TARGET PROTECTION CHECK (DON'T KICK FELLOW ADMINS/OWNER) ---
            const targetParticipant = participants.find(p => p.id === target);
            const isTargetAdmin = targetParticipant && (targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin');
            
            // Usijitoe wewe mwenyewe au bot
            if (target === botId) return m.reply("🤖 *Error:* Siwezi kujitoa mwenyewe!");
            if (target === senderId) return m.reply("⚠️ *Error:* Huwezi kujitoa mwenyewe, Mzee wa Pro Max!");
            
            // Kama mlengwa ni Admin, kataa isipokuwa ukiwa superadmin (inaweza kulete error kwa WhatsApp)
            if (isTargetAdmin) {
                return m.reply("🛡️ *Target Locked:* Mlengwa ni Admin mwenzangu. WhatsApp hairuhusu kumtoa Admin mwenzako, mvue u-admin kwanza!");
            }

            // --- 5. EXECUTION (THE BOOT) ---
            await sock.groupParticipantsUpdate(chat, [target], 'remove');

            // --- 6. PRO MAX DASHBOARD ---
            const senderNumber = senderId.split('@')[0];
            const totalMembers = participants.length;
            
            let dashboard = `🚀 *KICK PRO MAX V14.0: EXECUTED*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `👤 *Eliminated:* @${target.split('@')[0]}\n`;
            dashboard += `🛡️ *Authority Level:* Supreme\n`;
            dashboard += `👑 *Commanded By:* @${senderNumber}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `📊 *GROUP STATUS:*\n`;
            dashboard += `👥 Members Left: *${totalMembers - 1}*\n`;
            dashboard += `🕒 *Timestamp:* ${new Date().toLocaleTimeString('en-US', { hour12: false })}\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `*Perimeter Secured* 🔒`;

            return sock.sendMessage(chat, {
                text: dashboard,
                mentions: [target, senderId]
            }, { quoted: m });

        } catch (e) {
            console.log("🔥 Kick Pro Max Error: ", e);
            return m.reply("❌ *CRITICAL SYSTEM ERROR:* Imeshindikana kumtoa. Hali ya mamlaka inaingiliana au mlengwa hayupo tena.");
        }
    }
};
                
