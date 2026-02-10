/**
 * ANTILINK CLOUD LOGIC (Vercel Side)
 * Hili faili halitumi meseji, linatoa "Amri" tu.
 */

const linkWarnings = {}; // Kumbuka: Hii itafuta kila Vercel ikijizima (Serverless)

module.exports = async (body, sender, isAdmin, isBotAdmin, config) => {
    const senderNumber = sender.split('@')[0];
    const mentionTag = `@${senderNumber}`;
    
    // 1. Kagua kama ni Command ya kuwasha/zima (Antilink Toggle)
    const commandBody = body.toLowerCase();
    if (commandBody.startsWith(`${config.prefix}antilink`)) {
        // Maelekezo kwa mteja kutumia .antilink delete on
        const args = body.split(' ');
        const mode = args[1]?.toLowerCase();
        const status = args[2]?.toLowerCase();

        if (!mode || !['delete', 'warn', 'off'].includes(mode) || !status) {
            return {
                action: 'reply',
                text: `*🔥 ANTILINK V4 SETTINGS*\n\n*Usage:* \n${config.prefix}antilink delete on/off\n${config.prefix}antilink warn on/off`
            };
        }

        // Hapa utahitaji database (mfano MongoDB) kuhifadhi status ya group
        // Kwa sasa tunarudisha ujumbe wa mafanikio
        return {
            action: 'reply',
            text: `✅ *ANTILINK ${mode.toUpperCase()}* sasa ni *${status.toUpperCase()}*`
        };
    }

    // 2. Kagua kama kuna Link (Global Detection)
    const globalLinkRegex = /(https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)/gi;
    
    // Tuseme antilinkStatus inatoka kwenye database kule Vercel
    const antilinkStatus = config.antilinkMode || 'off'; 

    if (globalLinkRegex.test(body) && antilinkStatus !== 'off' && !isAdmin) {
        
        if (!isBotAdmin) return null; // Bot siyo admin, ipotezee

        // MODE: DELETE
        if (antilinkStatus === 'delete') {
            return {
                action: 'delete',
                text: `🚫 *LINK DETECTED*\n\nHey ${mentionTag}, links are prohibited!`,
                mentions: [sender]
            };
        }

        // MODE: WARN
        if (antilinkStatus === 'warn') {
            // Kumbuka: linkWarnings hapa itakuwa na shida kidogo kwenye Vercel Free
            // Inabidi utumie Database (MongoDB) kuhifadhi warnings
            linkWarnings[sender] = (linkWarnings[sender] || 0) + 1;
            const warns = linkWarnings[sender];

            if (warns >= 5) {
                linkWarnings[sender] = 0;
                return {
                    action: 'kick',
                    text: `❌ *LIMIT REACHED*\n\n${mentionTag} removed for link sharing (5/5).`,
                    mentions: [sender]
                };
            } else {
                return {
                    action: 'delete',
                    text: `⚠️ *WARNING [${warns}/5]*\n\n${mentionTag}, stop sharing links!`,
                    mentions: [sender]
                };
            }
        }
    }

    return null; // Hakuna tukio
};
    
