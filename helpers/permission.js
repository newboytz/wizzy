// helpers/permission.js

/**
 * Ultimate Guard System
 * - Owner check
 * - Public command check
 * - DM only check
 * - Group only check
 */

async function guard(sock, m, command, config, options = {}) {

    const { groupOnly = false, dmOnly = false } = options;

    const senderNumber = m.key.participant
        ? m.key.participant.split('@')[0]
        : m.key.remoteJid.split('@')[0];

    const isGroup = m.key.remoteJid.endsWith('@g.us');

    const isOwner = config.ownerNumber &&
        config.ownerNumber.map(v => v.replace(/[^0-9]/g, ''))
        .includes(senderNumber);

    const isPublic = config.publicCommands &&
        config.publicCommands.includes(command);

    // 🛡️ OWNER / PUBLIC CHECK
    if (!isOwner && !isPublic) {
        await sock.sendMessage(m.key.remoteJid, {
            text: "❌ This command is restricted to the bot owner."
        }, { quoted: m });
        return false;
    }

    // 📛 GROUP ONLY CHECK
    if (groupOnly && !isGroup) {
        await sock.sendMessage(m.key.remoteJid, {
            text: "❌ This command can only be used in groups."
        }, { quoted: m });
        return false;
    }

    // 📛 DM ONLY CHECK
    if (dmOnly && isGroup) {
        // Hii unaweza kufanya silent kama hutaki message
        await sock.sendMessage(m.key.remoteJid, {
            text: "❌ This command works only in private chat."
        }, { quoted: m });
        return false;
    }

    return true; // Ruhusa ipo
}

module.exports = { guard };
