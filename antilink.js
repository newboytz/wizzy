/**
 * ANTILINK PRO MAX V4 (ULTIMATE EDITION) 
 * Developed with: High-Speed Detection & Admin Protection
 */

const linkWarnings = {};

module.exports = async (sock, msg, config) => {
    // 1. EXTRACT DATA CORRECTLY
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    if (!isGroup) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || "";
    
    const senderNumber = sender.split('@')[0];
    const isOwner = config.ownerNumber.includes(senderNumber);

    // --- 2. CHECK ADMIN STATUS (The Secret Sauce) ---
    const groupMetadata = await sock.groupMetadata(chat);
    const participants = groupMetadata.participants;
    
    const isAdmin = participants.find(p => p.id === sender)?.admin !== null;
    const isBotAdmin = participants.find(p => p.id === sock.user.id.split(':')[0] + '@s.whatsapp.net')?.admin !== null;

    const mentionTag = `@${senderNumber}`;
    const mentions = [sender];

    // --- 3. COMMAND HANDLER (Antilink Toggle) ---
    const commandBody = body.toLowerCase();
    if (commandBody.startsWith(`${config.prefix}antilink`)) {
        if (!isAdmin && !isOwner) return;

        const args = body.split(' ');
        const mode = args[1]?.toLowerCase(); 
        const status = args[2]?.toLowerCase();

        if (!mode || !['delete', 'warn', 'off'].includes(mode) || !status) {
            return sock.sendMessage(chat, { 
                text: `*🔥 ANTILINK V4 SETTINGS*\n\n*Usage:* \n${config.prefix}antilink delete on/off\n${config.prefix}antilink warn on/off` 
            }, { quoted: msg });
        }

        if (status === 'on') {
            config.antilinkMode = mode;
            return sock.sendMessage(chat, { 
                text: `✅ *ANTILINK ${mode.toUpperCase()} ACTIVATED*\n\n*Protection:* GOD MODE (High Security)\n*Action:* Instant Delete + Tag 🔥` 
            }, { quoted: msg });
        } else {
            config.antilinkMode = 'off';
            return sock.sendMessage(chat, { text: `❌ *ANTILINK SYSTEM DISABLED*` }, { quoted: msg });
        }
    }

    // --- 4. GLOBAL LINK DETECTION (PRO MAX REGEX) ---
    const globalLinkRegex = /(https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)/gi;
    
    if (globalLinkRegex.test(body) && config.antilinkMode !== 'off' && !isAdmin && !isOwner) {
        
        // If the bot is not an admin, it cannot perform actions
        if (!isBotAdmin) {
            console.log("⚠️ Link detected but the bot is not an Admin!");
            return;
        }

        // DELETION KEY (The key to success)
        const keyToDelete = {
            remoteJid: chat,
            fromMe: false,
            id: msg.key.id,
            participant: sender
        };

        // MODE: DELETE
        if (config.antilinkMode === 'delete') {
            try {
                await sock.sendMessage(chat, { delete: keyToDelete });
                return sock.sendMessage(chat, { 
                    text: `🚫 *LINK DETECTED*\n\nHey ${mentionTag}, sharing links is strictly prohibited in this group! Your message has been removed.`, 
                    mentions: mentions 
                });
            } catch (e) {
                console.log("Deletion failed: ", e);
            }
        }

        // MODE: WARN
        if (config.antilinkMode === 'warn') {
            try {
                await sock.sendMessage(chat, { delete: keyToDelete });
                linkWarnings[sender] = (linkWarnings[sender] || 0) + 1;
                const warns = linkWarnings[sender];

                if (warns >= 5) {
                    await sock.sendMessage(chat, { 
                        text: `❌ *LIMIT REACHED*\n\n${mentionTag} has been kicked for repeated link sharing (5/5).`, 
                        mentions: mentions 
                    });
                    await sock.groupParticipantsUpdate(chat, [sender], 'remove');
                    linkWarnings[sender] = 0;
                } else {
                    return sock.sendMessage(chat, { 
                        text: `⚠️ *WARNING [${warns}/5]*\n\n${mentionTag}, links are not allowed here! Stop immediately or you will be removed.`, 
                        mentions: mentions 
                    });
                }
            } catch (e) {
                console.log("Warn/Delete failed: ", e);
            }
        }
    }
};

