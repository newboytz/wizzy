// plugins/antilink.js

const { guard } = require('../helpers/permission');

// Hapa tunahifadhi warnings kwa kila user
const linkWarnings = {};

module.exports = async (sock, m, { config }) => {

    const command = 'antilink';

    // --- GUARD: Group Only, Owner/Public Check ---
    // Hii command ni ya group tu
    const ok = await guard(sock, m, command, config, { groupOnly: true });
    if (!ok) return;

    const senderNumber = m.key.participant
        ? m.key.participant.split('@')[0]
        : m.key.remoteJid.split('@')[0];

    const sender = m.key.participant || m.key.remoteJid;
    const mentionTag = `@${senderNumber}`;

    // Pata body ya message
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";

    // --- 1️⃣ Handle command settings ---
    if (body.startsWith(`${config.prefix}antilink`)) {
        const args = body.trim().split(/ +/);
        const mode = args[1]?.toLowerCase(); // delete / warn / off
        const status = args[2]?.toLowerCase(); // on / off

        if (!mode || !['delete','warn','off'].includes(mode) || !status) {
            return await sock.sendMessage(m.key.remoteJid, {
                text: `*🔥 ${config.botName.toUpperCase()} ANTILINK SETTINGS*\n\n*Usage:* \n${config.prefix}antilink delete on/off\n${config.prefix}antilink warn on/off`,
                mentions: [sender]
            }, { quoted: m });
        }

        // Save settings to global config for demo (replace na DB in real)
        config.antilinkMode = mode === 'off' ? 'off' : mode;
        config.antilinkStatus = status;

        return await sock.sendMessage(m.key.remoteJid, {
            text: `✅ *${config.botName}:* ANTILINK ${mode.toUpperCase()} sasa ni *${status.toUpperCase()}*`,
            mentions: [sender]
        }, { quoted: m });
    }

    // --- 2️⃣ Detect links globally ---
    const antilinkStatus = config.antilinkMode || 'off';
    if (antilinkStatus === 'off') return;

    const linkRegex = /(https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)/gi;

    if (linkRegex.test(body)) {

        // Only bot admin can delete/kick
        const isBotAdmin = true; // replace na check ya real bot admin status
        const isAdmin = false; // replace na check ya group admin

        if (!isBotAdmin) return; // kama bot si admin, gome

        // MODE DELETE
        if (antilinkStatus === 'delete') {
            return await sock.sendMessage(m.key.remoteJid, {
                text: `🚫 *[ ${config.botName.toUpperCase()} ] LINK DETECTED*\n\nHey ${mentionTag}, links are prohibited!`,
                mentions: [sender]
            }, { quoted: m });
        }

        // MODE WARN
        if (antilinkStatus === 'warn') {
            linkWarnings[sender] = (linkWarnings[sender] || 0) + 1;
            const warns = linkWarnings[sender];

            if (warns >= 5) {
                linkWarnings[sender] = 0;
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `❌ *${config.botName} LIMIT REACHED*\n\n${mentionTag} removed for link sharing (5/5).`,
                    mentions: [sender]
                }, { quoted: m });
            } else {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `⚠️ *${config.botName} WARNING [${warns}/5]*\n\n${mentionTag}, stop sharing links!`,
                    mentions: [sender]
                }, { quoted: m });
            }
        }
    }
};
