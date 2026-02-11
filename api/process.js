import registry from '../database/registry.json' assert { type: 'json' };
import apiKeys from '../database/apikeys.json' assert { type: 'json' };

// Import Plugins zote hapa (Watu wa nyumba moja)
import antilink from '../plugins/antilink.js';
import tiktok from '../plugins/tiktok.js';
import ai from '../plugins/ai.js';
// ... ongeza plugins zingine hapa

const pluginsMap = { antilink, tiktok, ai };

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Denied' });

    const { clientId, body, sender, isGroup, isAdmin, isBotAdmin } = req.body;
    const client = registry[clientId];

    // 1. Validations
    if (!client) return res.json({ action: 'reply', text: "❌ Bot haijasajiliwa!" });
    
    // Check Expiry (Ili kuzuia error nimeongeza tarehe kwenye registry)
    if (new Date(client.expiry) < new Date()) {
        return res.json({ action: 'reply', text: "❌ Leseni yako imeisha!" });
    }

    const text = body ? body.toLowerCase().trim() : "";

    try {
        // 2. Antilink Logic
        if (isGroup && client.allowedPlugins.includes("antilink")) {
            const result = await antilink(body, sender, isAdmin, isBotAdmin, client);
            if (result) return res.json(result);
        }

        // 3. Command Logic
        if (text.startsWith('.')) {
            const cmd = text.split(' ')[0].replace('.', '');

            if (client.allowedPlugins.includes(cmd)) {
                const plugin = pluginsMap[cmd];
                if (plugin) {
                    // Tunatuma plugin ikiwa na funguo zake tu kwa usalama
                    const specificKeys = apiKeys[cmd] || {};
                    const response = await plugin(body, sender, client, specificKeys);
                    return res.json(response);
                }
            } else {
                return res.json({ action: 'reply', text: `🚫 Huna ruhusa ya: ${cmd}` });
            }
        }
    } catch (e) {
        console.error("Server Error:", e.message);
        return res.json({ action: 'reply', text: '❌ Hitilafu ya Server!' });
    }

    return res.json({ action: 'none' });
}
