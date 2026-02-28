// 📢 TAG ALL - QB PRO MAX EDITION (English)
if (command === 'tagall' || command === 'tag') {
    // 1. Guard Protection (Group Only)
    if (!await guard(sock, m, command, config, { groupOnly: true })) return;

    try {
        // 2. Fetch Group Participants
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;

        // 3. Prepare the Message - (m.text captures the message after the command)
        let userMsg = m.text ? m.text : 'Wake up everyone! Attention needed.';
        let tagMsg = `*📢 QB PRO MAX - TAG ALL*\n\n`;
        tagMsg += `📝 *Message:* ${userMsg}\n\n`;

        let mentions = [];
        for (let mem of participants) {
            tagMsg += ` @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        }

        // 4. Send with Mentions
        await sock.sendMessage(m.key.remoteJid, {
            text: tagMsg,
            mentions: mentions
        }, { quoted: m });

    } catch (err) {
        console.log(`❌ TagAll Error: ${err.message}`);
    }
            }
        
