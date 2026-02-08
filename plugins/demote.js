/**
 * ⚡ PROMOTE PRO MAX V15.9 (ULTIMATE EDITION)
 * Focus: Owner-Only Lockdown & Instant Admin Elevation                      * Language: English
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
    if (body.toLowerCase().startsWith(`${prefix}promote`)) {

        // Fetch Group Metadata & Intelligence
        const groupMetadata = await sock.groupMetadata(chat);
        const participants = groupMetadata.participants;

        // Check Owner Status
        const senderNumber = sender.split('@')[0];
        const isOwner = config.ownerNumber.includes(senderNumber);
        const isBotAdmin = participants.find(p => p.id === sock.user.id.split(':')[0] + '@s.whatsapp.net')?.admin !== null;

        // --- SECURITY LOCKDOWN (OWNER ONLY WITH TAG @) ---
        if (!isOwner) {
            return sock.sendMessage(chat, {
                text: `❌ Sorry @${senderNumber}, only the Owner can use this command!`,
                mentions: [sender]
            }, { quoted: msg });                                                    }

        // --- BOT ADMIN CHECK ---
        if (!isBotAdmin) {
            return sock.sendMessage(chat, { text: "⚠️ *SYSTEM ERROR:* I need Admin privileges to promote anyone!" });
        }

        // Identify Target (Tag or Reply)
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                     (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? msg.message.extendedTextMessage.contextInfo.participant : null);

        if (!target) return sock.sendMessage(chat, { text: "❌ *TARGET MISSING:* Tag a user or reply to their message to promote them!" });

        try {                                                                           // --- 2. EXECUTION (ELEVATE TO ADMIN) ---
            await sock.groupParticipantsUpdate(chat, [target], 'promote');

            // --- 3. CALCULATE NEW HIERARCHY STATS ---
            const totalMembers = participants.length;
            const newAdminCount = participants.filter(p => p.admin !== null).length + 1;
            const newRegularCount = totalMembers - newAdminCount;

            // --- 4. PRO MAX V15.9 DASHBOARD ---
            let dashboard = `⚡ *PROMOTE PRO MAX V15.9: SUCCESS*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `📈 *New Admin:* @${target.split('@')[0]}\n`;
            dashboard += `🛡️ *Action:* Admin Privileges Granted\n`;
            dashboard += `👑 *Authorized By:* Owner (@${senderNumber})\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `📊 *GROUP HIERARCHY UPDATED:*\n`;
            dashboard += `👥 Total Population: *${totalMembers}*\n`;
            dashboard += `👮 Total Admins: *${newAdminCount}*\n`;
            dashboard += `👤 Regular Members: *${newRegularCount}*\n`;
            dashboard += `━━━━━━━━━━━━━━━━━━━━\n`;
            dashboard += `*Hierarchy Status: New Leader Added* 🎖️`;

            return sock.sendMessage(chat, {
                text: dashboard,
                mentions: [target, sender]
            });

        } catch (e) {
            console.log("Promote Error: ", e);
            return sock.sendMessage(chat, { text: "❌ *CRITICAL FAILURE:* Could not promote user. They might already be an admin!" });
        }                                                                       }
};
