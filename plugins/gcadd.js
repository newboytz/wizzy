module.exports = {
    command: 'add',
    aliases: ['invite', 'gcadd', 'addgc'],
    category: 'group',
    description: 'Add a user to the group',
    usage: '.add <number> or reply to vcard/message',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        let targetNumber = null;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;

            if (quotedMsg.contactMessage) {
                const vcard = quotedMsg.contactMessage.vcard;
                const phoneMatch = vcard.match(/waid=(\d+)/);
                if (phoneMatch) {
                    targetNumber = phoneMatch[1];
                } else {
                    const telMatch = vcard.match(/TEL.*?:(\+?\d+)/);
                    if (telMatch) {
                        targetNumber = telMatch[1].replace(/\D/g, '');
                    }
                }
            } else if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
                const text = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
                const numberMatch = text.match(/(\+?\d{10,15})/);
                if (numberMatch) {
                    targetNumber = numberMatch[1].replace(/\D/g, '');
                }
            } else if (quotedParticipant) {
                targetNumber = quotedParticipant.split('@')[0];
            }
        }

        if (!targetNumber && args.length > 0) {
            const input = args.join(' ');
            const cleaned = input.replace(/[^\d+]/g, '');
            targetNumber = cleaned.replace(/^\+/, '');
        }

        if (!targetNumber) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Please provide a number to add!*

*Usage:*
• \`.add 255775923311\`
• \`.add +255775923311\`
• \`.add 255 775 923311\`
• Reply to a vcard with \`.add\`
• Reply to a message with \`.add\``
            }, { quoted: message });
        }

        if (!/^[1-9]/.test(targetNumber)) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Invalid number format!*\n\nPlease include the country code.\nExample: 2557XXXXXXXXX'
            }, { quoted: message });
        }

        const targetJid = `${targetNumber}@s.whatsapp.net`;

        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);

            if (participants.includes(targetJid)) {
                return await sock.sendMessage(chatId, {
                    text: `⚠️ *User is already in the group!*\n\n${targetNumber}`
                }, { quoted: message });
            }

            const result = await sock.groupParticipantsUpdate(
                chatId,
                [targetJid],
                'add'
            );

            if (result[0].status === '200') {
                await sock.sendMessage(chatId, {
                    text: `✅ *Successfully added!*\n\n@${targetNumber}`,
                    mentions: [targetJid]
                }, { quoted: message });
            } else if (result[0].status === '403') {
                await sock.sendMessage(chatId, {
                    text: `❌ *Failed to add user!*\n\n*Reason:* User has privacy settings that prevent being added to groups.\n\n*Solution:* Send them the group invite link.`
                }, { quoted: message });
            } else if (result[0].status === '408') {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *Invite sent!*\n\nUser needs to accept the invitation to join.`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Failed to add user!*\n\n*Status:* ${result[0].status}\n\nThe user may have blocked the bot or changed their privacy settings.`
                }, { quoted: message });
            }

        } catch (error) {
            console.error('Add command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *Error adding user!*\n\n${error.message}`
            }, { quoted: message });
        }
    }
};