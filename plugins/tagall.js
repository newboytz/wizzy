cat: cat: No such file or directory
module.exports = async (client, m, config) => {
    const prefix = config.prefix || '.';
    const body = m.body || '';
    const command = body.toLowerCase().split(' ')[0];

    if (command === `${prefix}tagall`) {
        // 1. SECURITY & ACCESS CONTROL
        const isOwner = config.ownerNumber.includes(m.sender.split('@')[0]); //                                                                                 const isPublic = config.publicMode === true; //
        const isAdmin = m.isAdmin; //

        // Only allow if bot is Public OR sender is Owner/Admin
        if (!isPublic && !isOwner && !isAdmin) return;

        // 2. GROUP CHECK
        if (!m.isGroup) return;

        try {
            // 3. FETCH GROUP DATA
            const groupMetadata = await client.groupMetadata(m.chat);
            const participants = groupMetadata.participants;
            const groupAdmins = participants.filter(p => p.admin !== null); 
            // 4. PRO MAX V4 UI (Header)
            let header = `*🔥 CHUBWA-MD V4 TAG-ALL 🔥*\n\n`;                            header += `*👤 REQUESTER:* ${m.pushName || 'User'}\n`; //
            header += `*👥 MEMBERS:* ${participants.length}\n`;
            header += `*👮 ADMINS:* ${groupAdmins.length}\n`;

            // Extract custom message after the command
            const customMsg = body.slice(command.length).trim();
            header += `*📢 MESSAGE:* ${customMsg || 'Attention everyone!'}\n\n`;
            header += `*--- BROADCAST LIST ---*\n\n`;

            // 5. GENERATE MENTIONS
            let list = "";
            let mentions = [];

            for (let participant of participants) {
                list += `🚀 @${participant.id.split('@')[0]}\n`;
                mentions.push(participant.id);
            }

            // 6. STYLISH FOOTER
            let footer = `\n*©2026 Powered by TXT* 💥`;

            // 7. SEND MESSAGE WITH ALL MENTIONS
            await client.sendMessage(m.chat, {
                text: header + list + footer,
                mentions: mentions
            }, { quoted: m });

        } catch (error) {
            console.log("TagAll Error:", error);
        }
    }                                                                       };
