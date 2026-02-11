/**
 * ⚡ PROMOTE PRO MAX V15.9 (ULTIMATE EDITION) - GITHUB SIDE
 * Focus: Owner-Only Lockdown & Security Logic
 */
export default async function promote(body, sender, client) {
    const prefix = "."; // Inatoka kwenye config
    
    if (body.toLowerCase().startsWith(`${prefix}promote`)) {
        const senderNumber = sender.split('@')[0];

        // --- SECURITY LOCKDOWN (OWNER ONLY) ---
        // Tunakagua kama mteja ni "Owner" kupitia registry
        if (client.plan !== "Owner/Developer") {
            return {
                action: 'reply',
                text: `❌ Sorry @${senderNumber}, only the Owner can use this command!`,
                mentions: [sender]
            };
        }

        // Tunatuma amri ya kwenda kufanya kazi kwa mteja
        return {
            action: 'execute_promote',
            senderNumber: senderNumber
        };
    }
    return null;
}
