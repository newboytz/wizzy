/**
 * PLUGIN: OWNER INFO PRO
 * Inaangalia usalama kwanza kabla ya kutoa jibu
 */

module.exports = {
    name: "owner",
    alias: ["developer", "junior"],
    run: async (sock, m, { config, isOwner, cleanSender }) => {
        
        // 1. CHUKUA LIST YA PUBLIC COMMANDS
        const publicCmds = Array.isArray(config.publicCommands) ? config.publicCommands : [];

        // 2. LOGIC YA GETI: Je, amri ya 'owner' imeruhusiwa kwa umma?
        // Kama haipo kwenye publicCommands NA anayeuliza siyo Owner, gomea kabisa!
        if (!publicCmds.includes("owner") && !isOwner) {
            console.log(`🔒 [PLUGIN LOCK] ${cleanSender} amegomewa kuona owner info.`);
            return m.reply("❌ Amri hii imefungwa kwa sasa. Ni mmiliki pekee anaweza kuona taarifa hizi.");
        }

        // 3. JIBU LA UNYAMA (KAMA AMEVUKA GETI)
        const ownerName = "Junior"; // Jina lako uliloomba
        const replyText = `🚀 *BOT OWNER INFO* 🚀\n\n` +
                          `👤 *Name:* ${ownerName}\n` +
                          `🛡️ *Status:* System Developer\n` +
                          `🔗 *Github:* github.com/junior-tz\n\n` +
                          `_Powered by Junior Bot System_`;

        await m.reply(replyText);
    }
};
