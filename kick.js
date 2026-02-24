module.exports = {
    name: "kick",
    description: "Kick a member from the group",
    run: async (sock, m, { guard, config, command, text }) => {
        
        // 1️⃣ --- GUARD SYSTEM CHECK ---
        // Inahakikisha hii command inatumika kwenye Group pekee na na Owner/Authorized
        if (!await guard(sock, m, command, config, { groupOnly: true })) return;

        const from = m.key.remoteJid;

        // 2️⃣ --- TARGET IDENTIFICATION ---
        // Inatafuta nani wa kupigwa "Shoe" (Mention, Reply, au Text)
        let users = m.mentionedJid[0] 
                    ? m.mentionedJid[0] 
                    : m.quoted 
                        ? m.quoted.sender 
                        : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        if (!users || users.length < 10) {
            return m.reply("❌ *Error:* Please tag a user, reply to their message, or type their number.");
        }

        // 3️⃣ --- PERMISSION CHECK (Bot Admin Status) ---
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botIsAdmin = participants.find(p => p.id === botId)?.admin;

        if (!botIsAdmin) {
            return m.reply("❌ *Failed:* I need to be an **Admin** to kick members.");
        }

        // 4️⃣ --- EXECUTION (The Kick) ---
        try {
            await sock.groupParticipantsUpdate(from, [users], "remove");
            
            // 🏗️ Build High-End Notification
            let response = `*━─┈❮ 🚨 GROUP KICK 🚨 ❯┈─━*\n\n`;
            response += `👞 *Target:* @${users.split('@')[0]}\n`;
            response += `👮 *Action By:* ${m.pushName || 'Admin'}\n`;
            response += `📍 *Status:* Removed Successfully\n`;
            response += `🕒 *Time:* ${new Date().toLocaleTimeString()}\n\n`;
            response += `*--- USER HAS BEEN EXPELLED ---*`;

            await sock.sendMessage(from, { 
                text: response, 
                mentions: [users] 
            }, { quoted: m });

            console.log(`\x1b[31m👞 [KICK] ${users} removed from ${groupMetadata.subject}\x1b[0m`);
        } catch (e) {
            await m.reply("❌ *Error:* Could not kick the user. They might have already left or I don't have permission.");
            console.log("Kick Error:", e);
        }
    }
};
                
