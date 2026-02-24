// plugins/antilink.js

const { guard } = require('../helpers/permission');

const linkWarnings = {};

module.exports = {
    name: "antilink",
    run: async (sock, m, { config, command, isAdmin, isBotAdmin }) => {

        // 🔒 HII NI GROUP ONLY
        if (!(await guard(sock, m, command, config, {
            groupOnly: true
        }))) return;

        const body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            "";

        const sender = m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const mentionTag = `@${senderNumber}`;

        // ===============================
        // 1️⃣ SETTINGS COMMAND
        // ===============================
        if (body.toLowerCase().startsWith(`${config.prefix}antilink`)) {

            if (!isAdmin) {
                return sock.sendMessage(m.key.remoteJid, {
                    text: "❌ Only group admins can change antilink settings."
                }, { quoted: m });
            }

            const args = body.trim().split(/\s+/);
            const mode = args[1]?.toLowerCase();
            const status = args[2]?.toLowerCase();

            if (!mode || !['delete', 'warn', 'off'].includes(mode) || !status) {
                return sock.sendMessage(m.key.remoteJid, {
                    text:
`🔥 *${config.botName.toUpperCase()} ANTILINK SETTINGS*

Usage:
${config.prefix}antilink delete on
${config.prefix}antilink warn on
${config.prefix}antilink off on`
                }, { quoted: m });
            }

            // Save mode inside config memory
            config.antilinkMode = mode === 'off' ? 'off' : mode;

            return sock.sendMessage(m.key.remoteJid, {
                text: `✅ *${config.botName}:* ANTILINK mode set to *${mode.toUpperCase()}*`
            }, { quoted: m });
        }

        // ===============================
        // 2️⃣ GLOBAL LINK DETECTION
        // ===============================
        const globalLinkRegex =
            /(https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)/gi;

        const antilinkStatus = config.antilinkMode || 'off';

        if (
            globalLinkRegex.test(body) &&
            antilinkStatus !== 'off' &&
            !isAdmin
        ) {

            if (!isBotAdmin) return;

            // 🔥 DELETE MODE
            if (antilinkStatus === 'delete') {

                await sock.sendMessage(m.key.remoteJid, {
                    delete: m.key
                });

                return sock.sendMessage(m.key.remoteJid, {
                    text:
`🚫 *[ ${config.botName.toUpperCase()} ] LINK DETECTED*

Hey ${mentionTag}, links are prohibited!`,
                    mentions: [sender]
                });
            }

            // ⚠️ WARN MODE
            if (antilinkStatus === 'warn') {

                linkWarnings[sender] =
                    (linkWarnings[sender] || 0) + 1;

                const warns = linkWarnings[sender];

                await sock.sendMessage(m.key.remoteJid, {
                    delete: m.key
                });

                if (warns >= 5) {

                    linkWarnings[sender] = 0;

                    await sock.groupParticipantsUpdate(
                        m.key.remoteJid,
                        [sender],
                        "remove"
                    );

                    return sock.sendMessage(m.key.remoteJid, {
                        text:
`❌ *${config.botName} LIMIT REACHED*

${mentionTag} removed for link sharing (5/5).`,
                        mentions: [sender]
                    });
                }

                return sock.sendMessage(m.key.remoteJid, {
                    text:
`⚠️ *${config.botName} WARNING [${warns}/5]*

${mentionTag}, stop sharing links!`,
                    mentions: [sender]
                });
            }
        }
    }
};
