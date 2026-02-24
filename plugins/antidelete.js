module.exports = {
    name: "antidelete",
    run: async (sock, m, { config, ramStore }) => {

        // 1. Logic ya ku-detect ujumbe uliyofutwa (Protocol Message)
        if (m.message?.protocolMessage?.type === 0) {
            
            const deletedKey = m.message.protocolMessage.key;
            const storeData = ramStore.get(deletedKey.id); // Inapata ujumbe kutoka RAM

            if (storeData) {
                const originalMsg = storeData.data;
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                const from = originalMsg.key.remoteJid;
                const isGroup = from.endsWith('@g.us');
                const type = Object.keys(originalMsg.message)[0];
                
                // --- ANDAA TAARIFA ---
                let notification = `*━─┈❮🚨 ANTI-DELETE 🚨❯┈─━*\n\n`;
                notification += `👤 *Sender:* @${sender.split('@')[0]}\n`;
                notification += `📍 *Location:* ${isGroup ? 'Group Chat' : 'Private Chat'}\n`;
                if (isGroup) notification += `💬 *Group ID:* ${from}\n`;
                notification += `🕒 *Time:* ${new Date().toLocaleTimeString()}\n`;
                notification += `📜 *Type:* ${type}\n\n`;
                notification += `*--- DELETED CONTENT BELOW ---*`;

                // 2. TUMA KWENYE DM YA OWNER (Automatic)
                // Inachukua namba ya kwanza kwenye ownerNumber ya config yako
                const ownerJid = config.ownerNumber[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

                try {
                    // Tuma maelezo
                    await sock.sendMessage(ownerJid, { 
                        text: notification, 
                        mentions: [sender] 
                    });
                    
                    // Tuma ule ujumbe wenyewe uliyofutwa (Forward)
                    await sock.copyNForward(ownerJid, originalMsg, false);
                    
                    console.log(`\x1b[33m🛡️ [ANTI-DELETE] Deleted message forwarded to Owner DM\x1b[0m`);
                } catch (e) {
                    console.log("Error sending anti-delete to DM:", e);
                }
            }
        }
    }
};
          
