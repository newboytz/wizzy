import registry from '../database/registry.json';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Denied' });
    }

    const { clientId, body, sender, isGroup, isAdmin, isBotAdmin } = req.body;
    const text = body ? body.toLowerCase().trim() : "";

    const client = registry[clientId];
    if (!client) {
        return res.json({ action: 'reply', text: "❌ Bot haijasajiliwa!" });
    }

    try {
        // ANTILINK
        if (isGroup && client.allowedPlugins.includes("antilink")) {
            const antilinkModule = await import('../plugins/antilink.js');
            const antilink = antilinkModule.default || antilinkModule;

            const result = await antilink(body, sender, isAdmin, isBotAdmin, client);
            if (result) return res.json(result);
        }

        // COMMANDS
        if (text.startsWith('.')) {
            const cmd = text.split(' ')[0].replace('.', '');

            if (client.allowedPlugins.includes(cmd)) {
                try {
                    const pluginModule = await import(`../plugins/${cmd}.js`);
                    const plugin = pluginModule.default || pluginModule;

                    const response = await plugin(body, sender, client);
                    if (response) return res.json(response);
                } catch (e) {
                    return res.json({
                        action: 'reply',
                        text: `❌ Plugin error: ${cmd}`
                    });
                }
            } else {
                return res.json({
                    action: 'reply',
                    text: `🚫 Huna ruhusa ya: ${cmd}`
                });
            }
        }
    } catch (e) {
        return res.json({ action: 'reply', text: '❌ Server error' });
    }

    return res.json({ action: 'none' });
                }
