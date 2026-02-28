/**
 * PLUGIN: TagAll (QB PRO MAX)
 * Structure: Optimized for Dynamic VM Loader
 */

module.exports.run = async (sock, m, { config, text, guard, command }) => {
    // 1. Ulinzi wa Guard (Group Only) - Unatumia logic uliyoweka kwenye index.js
    // Hii inazuia plugin kuwaka kwenye DM na kuleta error
    if (!await guard(sock, m, command, config, { groupOnly: true })) return;

    try {
        // 2. Pata orodha ya wanachama kwanza (Vuta kutoka Cache/Metadata)
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;

        // 3. Andaa kichwa cha habari na ujumbe (Dynamic Message)
        let message = `*📢 TAG ALL - ATTENTION EVERYONE*\n\n`;
        message += `📝 *Message:* ${text || 'No specific message provided.'}\n\n`;

        // 4. Mzunguko wa Mentions (High Speed Loop)
        // Tunatengeneza array ya mentions na list ya majina kwa mpigo mmoja
        let mentions = [];
        let list = "";

        for (let mem of participants) {
            list += ` @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        }

        message += list;
        message += `\n*🛡️ Powered by QB PRO MAX*`;

        // 5. Tuma ujumbe wenye "Blue Tags" (Notification kwa kila mtu)
        // Tunatumia m.key.remoteJid kwa sababu ndio target yetu
        await sock.sendMessage(m.key.remoteJid, {
            text: message,
            mentions: mentions
        }, { quoted: m });

    } catch (err) {
        // Ikitokea hitilafu (mfano: network), itairekodi bila kuzima bot
        console.error(`❌ TagAll Plugin Error: ${err.message}`);
    }
};
    
