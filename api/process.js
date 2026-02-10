import registry from '../database/registry.json';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Denied' });

    const { clientId, body, sender, isGroup, isAdmin } = req.body;
    const text = body ? body.toLowerCase() : "";
    
    // 1. Uhakiki wa Mteja (Registration Check)
    const client = registry[clientId];
    if (!client) {
        return res.json({ action: 'reply', text: "❌ System Error: Client ID not registered!" });
    }

    try {
        // 2. RUN AUTO-PLUGINS (Kama Antilink - Inakimbia kila meseji)
        if (isGroup && client.allowedPlugins.includes("antilink")) {
            const antilink = require('../plugins/antilink.js');
            const antilinkCheck = await antilink(body, sender, isAdmin);
            if (antilinkCheck) return res.json(antilinkCheck); 
        }

        // 3. RUN COMMAND-PLUGINS (Zinazoanza na prefix '.')
        if (text.startsWith('.')) {
            const cmdName = text.split(' ')[0].replace('.', ''); // Mfano: 'tiktok'
            
            if (client.allowedPlugins.includes(cmdName)) {
                const plugin = require(`../plugins/${cmdName}.js`);
                const result = await plugin(body, sender, client);
                return res.json(result);
            } else {
                return res.json({ action: 'reply', text: `⚠️ Access Denied: Huna ruhusa ya kutumia .${cmdName}` });
            }
        }

    } catch (e) {
        console.log("Routing Error:", e.message);
        return res.json({ action: 'none' });
    }

    return res.json({ action: 'none' });
            }
            
