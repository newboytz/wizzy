module.exports = {
    name: "tagall",
    description: "Mentions all members in the group with style",
    run: async (sock, m, { guard, config, command, text }) => {
        
        // 1. --- 🛡️ GUARD CHECK ---
        // Inahakikisha bot haipotezi muda nje ya group
        if (!await guard(sock, m, command, config, { groupOnly: true, adminOnly: true })) return;

        try {
            // 2. --- GET DATA ---
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const participants = groupMetadata.participants;
            const botName = config.botName || "QB BOT"; // Inavuta jina kutoka kwenye config yako

            // 3. --- PREPARE CONTENT ---
            let userMsg = text ? text : 'Amkeni amkeni! Kuna jambo huku...';
            
            // Unyama wa header uliotulia
            let tagMsg = `╔══════ ✨ *${botName.toUpperCase()}* ✨ ══════╗\n\n`;
            tagMsg += `📢  *TAG ALL ANNOUNCEMENT*\n`;
            tagMsg += `📝  *Message:* ${userMsg}\n\n`;
            tagMsg += `✨ *Members:* ${participants.length}\n`;
            tagMsg += `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;

            let mentions = [];
            let list = "";

            // 4. --- MENTIONS LOOP ---
            for (let mem of participants) {
                list += `  ◦  @${mem.id.split('@')[0]}\n`;
                mentions.push(mem.id);
            }

            tagMsg += list;
            tagMsg += `\n╚═══════════════════════════╝\n`;
            tagMsg += `\n*🛡️ Powered by ${botName}*`;

            // 5. --- SEND MESSAGE ---
            await sock.sendMessage(m.key.remoteJid, {
                text: tagMsg,
                mentions: mentions
            }, { quoted: m });

        } catch (err) {
            console.log(`❌ TagAll Error: ${err.message}`);
            await sock.sendMessage(m.key.remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: m });
        }
    }
};
                
