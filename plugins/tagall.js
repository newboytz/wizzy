module.exports = {
    name: "tagall",
    description: "Mentions everyone in the group",
    run: async (sock, m, { guard, config, command, text }) => {
        
        // 1. --- 🛡️ GUARD CHECK ---
        // Inahakikisha inafanya kazi kwenye Group tu
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        try {
            // 2. --- GET GROUP DATA ---
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            const participants = groupMetadata.participants;

            // 3. --- PREPARE MESSAGE ---
            // Inatumia jina la bot yako kutoka kwenye config
            let userMsg = text ? text : 'Attention everyone! Check the group.';
            let tagMsg = `*📢 ${config.botName.toUpperCase()} - TAG ALL*\n\n`; 
            tagMsg += `📝 *Message:* ${userMsg}\n\n`;

            let mentions = [];
            let list = "";

            // 4. --- MENTIONS LOOP ---
            for (let mem of participants) {
                list += ` @${mem.id.split('@')[0]}\n`;
                mentions.push(mem.id);
            }

            tagMsg += list;
            tagMsg += `\n*🛡️ Powered by ${config.botName}*`;

            // 5. --- SEND MESSAGE ---
            await sock.sendMessage(m.key.remoteJid, {
                text: tagMsg,
                mentions: mentions
            }, { quoted: m });

        } catch (err) {
            // Inarekodi kosa bila kuua mfumo
            console.log(`❌ TagAll Error: ${err.message}`);
        }
    }
}; // <--- HAKIKISHA HILI BANO LIPO!
                
