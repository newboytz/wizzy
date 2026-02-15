/**
 * ANTILINK CLOUD LOGIC (Vercel Side)
 * Imetengenezwa kutumia jina la bot kutoka kwenye config
 */

const linkWarnings = {}; 

module.exports = async (body, sender, isAdmin, isBotAdmin, config) => {
    const senderNumber = sender.split('@')[0];
    const mentionTag = `@${senderNumber}`;
    
    // 1. Kagua kama ni Command ya kuwasha/zima
    const commandBody = body.toLowerCase();
    if (commandBody.startsWith(`${config.prefix}antilink`)) {
        const args = body.split(' ');
        const mode = args[1]?.toLowerCase();
        const status = args[2]?.toLowerCase();

        if (!mode || !['delete', 'warn', 'off'].includes(mode) || !status) {
            return {
                action: 'reply',
                // Hapa inachukua jina la bot kutoka kwenye config
                text: `*🔥 ${config.botName.toUpperCase()} ANTILINK SETTINGS*\n\n*Usage:* \n${config.prefix}antilink delete on/off\n${config.prefix}antilink warn on/off`
            };
        }

        return {
            action: 'reply',
            text: `✅ *${config.botName}:* ANTILINK ${mode.toUpperCase()} sasa ni *${status.toUpperCase()}*`
        };
    }

    // 2. Kagua kama kuna Link (Global Detection)
    const globalLinkRegex = /(https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/|tinyurl\.com\/)/gi;
    
    const antilinkStatus = config.antilinkMode || 'off'; 

    if (globalLinkRegex.test(body) && antilinkStatus !== 'off' && !isAdmin) {
        
        if (!isBotAdmin) return null; 

        // MODE: DELETE
        if (antilinkStatus === 'delete') {
            return {
                action: 'delete',
                text: `🚫 *[ ${config.botName.toUpperCase()} ] LINK DETECTED*\n\nHey ${mentionTag}, links are prohibited!`,
                mentions: [sender]
            };
        }

        // MODE: WARN
        if (antilinkStatus === 'warn') {
            linkWarnings[sender] = (linkWarnings[sender] || 0) + 1;
            const warns = linkWarnings[sender];

            if (warns >= 5) {
                linkWarnings[sender] = 0;
                return {
                    action: 'kick',
                    text: `❌ *${config.botName} LIMIT REACHED*\n\n${mentionTag} removed for link sharing (5/5).`,
                    mentions: [sender]
                };
            } else {
                return {
                    action: 'delete',
                    text: `⚠️ *${config.botName} WARNING [${warns}/5]*\n\n${mentionTag}, stop sharing links!`,
                    mentions: [sender]
                };
            }
        }
    }

    return null; 
};
