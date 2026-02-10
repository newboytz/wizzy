import registry from '../database/registry.json';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Denied' });

    const { clientId, body, sender, isGroup, isAdmin, isBotAdmin } = req.body;
    const text = body ? body.toLowerCase().trim() : "";

    // 1. Uhakiki wa Mteja
    const client = registry[clientId];
    if (!client) {
        return res.json({ action: 'reply', text: "❌ Bot haijasajiliwa!" });
    }

    try {
        // 2. Antilink Logic (Plug 1)
        if (isGroup && client.allowedPlugins.includes("antilink")) {
            const antilink = require('../plugins/antilink.js');
            const result = await antilink(body, sender, isAdmin, isBotAdmin);
            if (result) return res.json(result);
        }

        // 3. Command Logic (Plugs zingine)
        if (text.startsWith('.')) {
            const cmd = text.split(' ')[0].replace('.', '');
            if (client.allowedPlugins.includes(cmd)) {
                const plugin = require(`../plugins/${cmd}.js`);
                const response = await plugin(body, sender, client);
                return res.json(response);
            } else {
                return res.json({ action: 'reply', text: `🚫 Huna ruhusa ya: ${cmd}` });
            }
        }
    } catch (e) {
        return res.json({ action: 'none' });
    }
    return res.json({ action: 'none' });
}
