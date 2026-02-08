module.exports = async (sock, msg, config) => {
    const prefix = config.prefix || '.';
    const body = msg.body || '';
    const command = body.toLowerCase().split(' ')[0];
    const q = body.slice(command.length).trim();

    // 1. Taarifa za mtumaji
    const sender = msg.sender; // Hii ndio ID kamili (mfano: 255xxx@s.whatsapp.net)
    const senderNumber = sender.replace(/[^0-9]/g, '');

    // 2. Safisha namba za owner                                                const cleanOwners = Array.isArray(config.ownerNumber)
        ? config.ownerNumber.map(num => String(num).replace(/[^0-9]/g, ''))
        : [String(config.ownerNumber).replace(/[^0-9]/g, '')];

    const isOwner = cleanOwners.includes(senderNumber);

    if (command === `${prefix}hidetag`) {
        // 3. KAMA SIYO OWNER: M-tag mtumaji
        if (!isOwner) {
            return sock.sendMessage(msg.chat, {
                text: `Sorry @${senderNumber}, owner only can use this command! 👮‍♂️`,
                contextInfo: {
                    mentionedJid: [sender] // Hii inafanya tag iwe blue na kumpa notification                                                                           }                                                                       }, { quoted: msg });                                                    }                                                                   
        if (!msg.chat.endsWith('@g.us')) return;                                                                                                                try {                                                                           const groupMetadata = await sock.groupMetadata(msg.chat);                   const participants = groupMetadata.participants.map(v => v.id);

            if (msg.quoted) {
                // Forward na tag (Clean Style)
                await sock.sendMessage(msg.chat, {
                    forward: msg.quoted.fakeObj,
                    contextInfo: {
                        mentionedJid: participants,
                        quotedMessage: msg.message
                    }
                });
            } else {
                if (!q) return;

                // Tuma ujumbe na tag (Simple & Clean)
                await sock.sendMessage(msg.chat, {
                    text: q,
                    contextInfo: {
                        mentionedJid: participants
                    }
                }, { quoted: msg });
            }

            // React baada ya kumaliza
            await sock.sendMessage(msg.chat, { react: { text: "📢", key: msg.key } });

        } catch (e) {
            console.error("Error hidetag:", e);
        }
    }
};
