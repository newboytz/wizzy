/**
 * ⚡ KICK PRO MAX V13.9 (OWNER EDITION)
 * Focus: High-Speed Instant Removal & Owner Lockdown with Tag
 * Language: English
 */

module.exports = async (sock, msg, config) => {
    const chat = msg.key.remoteJid;
    if (!chat.endsWith('@g.us')) return;

    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption || "";

    const sender = msg.key.participant || msg.key.remoteJid;
    const senderName = msg.pushName || "User";
    const prefix = config.prefix;

    // --- 1. COMMAND DETECTION ---
    if (body.toLowerCase().startsWith(`${prefix}kick`)) {

        // Fetch Group Intelligence
        const groupMetadata = await sock.groupMetadata(chat);
        const participants = groupMetadata.participants;

        const senderNumber = sender.split('@')[0];
        const isOwner = config.ownerNumber.includes(senderNumber);
        const isBotAdmin = participants.find(p => p.id === sock.user.id.split(':')[0] + '@s.whatsapp.net')?.admin !== null;
                                                                                    // --- OWNER ONLY LOCKDOWN WITH TAG @ ---
        if (!isOwner) {
            return sock.sendMessage(chat, {
                text: `❌ Sorry @${senderNumber}, only the Owner can use this command!`,
                mentions: [sender] // Inahakikisha tag inaonekana
            }, { quoted: msg });
        }

        // --- BOT ADMIN CHECK ---                                                  if (!isBotAdmin) {
            return sock.sendMessage(chat, { text: "⚠️ *ACCESS DENIED:* Bot must be an Admin to execute this command!" });
        }

        // Identify Target (Tag or Reply)
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                     (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? msg.message.extendedTextMessage.contextInfo.participant : null);

        if (!target) return sock.sendMessage(chat, { text: "❌ *ERROR:* Please mention a user or reply to their message to kick them!" });

        try {
            // --- 2. ADVANCED DATA ANALYSIS ---
            const totalMembers = participants.length;
            const adminCount = participants.filter(p => p.admin !== null).length;
            const userCount = totalMembers - adminCount;
            const targetTag = `@${target.split('@')[0]}`;

            // --- 3. EXECUTION ---
            await sock.groupParticipantsUpdate(chat, [target], 'remove');

            // --- 4. PRO MAX V13.9 DASHBOARD ---
            let dashboard = `🚀 *KICK PRO MAX V13.9: SUCCESS*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;                                      dashboard += `👤 *User:* ${targetTag}\n`;
            dashboard += `🛡️ *Action:* Instant Permanent Ban\n`;
            dashboard += `👑 *Authorized By:* Owner (@${senderNumber})\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `📊 *GROUP REAL-TIME STATS:*\n`;
            dashboard += `👥 Total Survivors: *${totalMembers - 1}*\n`;
            dashboard += `👮 Active Admins: *${adminCount}*\n`;
            dashboard += `👤 Regular Members: *${userCount - 1}*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `*System Status: Locked & Secured* 🛡️`;

            return sock.sendMessage(chat, {
                text: dashboard,
                mentions: [target, sender]
            });

        } catch (e) {                                                                   console.log("Kick Error: ", e);
            return sock.sendMessage(chat, { text: "❌ *CRITICAL ERROR:* Failed to remove the user. They might have left or blocked the bot." });
        }
    }
};
