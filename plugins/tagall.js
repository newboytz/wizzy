case 'tagall': {
    // 1. Ulinzi wa Guard (Group Only) kama ulivyoomba
    if (!await guard(sock, m, command, config, { groupOnly: true })) return;

    try {
        // 2. Pata orodha ya wanachama wote kwenye group
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;

        // 3. Andaa ujumbe na mentions
        let message = `*📢 TAG ALL - ${config.botName}*\n\n`;
        message += `📝 *MASSAGE:* ${m.text || 'Amka amka! Kuna jambo huku.'}\n\n`;

        let mentions = [];
        for (let participant of participants) {
            message += ` @${participant.id.split('@')[0]}\n`;
            mentions.push(participant.id);
        }

        // 4. Tuma ujumbe wenye "Super Mentions"
        await sock.sendMessage(m.key.remoteJid, {
            text: message,
            mentions: mentions
        }, { quoted: m });

    } catch (err) {
        console.error(`${rc.red}❌ TagAll Error: ${err.message}${rc.reset}`);
    }
    break;
}
