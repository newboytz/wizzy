/**
 * PLUGIN: OWNER INFO PRO (ULTRA SECURE)
 * Hii itagoma iwe Group au Private kama siyo Owner anayetumia
 */

module.exports = {
    name: "owner",
    alias: ["developer", "junior"],
    run: async (sock, m, { config, isOwner, cleanSender, isGroup }) => {
        
        // 1. 🔥 HARD SECURITY CHECK (THE WALL)
        // Kama anayetuma SIYO Owner, block mara moja!
        if (!isOwner) {
            const chatType = isGroup ? "Group" : "Private Chat";
            console.log(`🚨 [SECURITY ALERT] ${cleanSender} amejaribu kuona Owner Info kwenye ${chatType}. ZUIO LIMEWEKWA.`);
            
            // Unaweza kuchagua: Bot itume ujumbe AU isijibu kabisa (return)
            return m.reply("🚫 *ACCESS DENIED* 🚫\n\nAmri hii ni kwa ajili ya Mmiliki wa Bot pekee. Haijalishi uko wapi.");
        }

        // 2. 🔐 MAINTENANCE & CONFIG CHECK (NYONGEZA YA ULINZI)
        const publicCmds = Array.isArray(config.publicCommands) ? config.publicCommands : [];
        const isPubliclyEnabled = publicCmds.includes("owner");

        // Hata kama isOwner ni false (ingawa tumesha-block hapo juu), hii ni double-layer security
        if (!isPubliclyEnabled && !isOwner) {
            return; // Inatoka kimya kimya
        }

        // 3. ✅ JIBU LA UNYAMA (KAMA NI MMILIKI)
        const ownerName = "Junior"; 
        const replyText = `🚀 *SYSTEM ACCESS GRANTED* 🚀\n\n` +
                          `👤 *Developer:* ${ownerName}\n` +
                          `🛡️ *Rank:* Senior System Admin\n` +
                          `🔗 *Github:* github.com/junior-tz\n\n` +
                          `🔓 _Hali ya usalama: MMILIKI AMETHIBITISHWA._`;

        await m.reply(replyText);
    }
};
            
