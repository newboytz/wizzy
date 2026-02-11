import registry from '../database/registry.json';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Denied' });
    }

    const { clientId, body, sender, isGroup, isAdmin, isBotAdmin } = req.body;
    const text = body ? body.toLowerCase().trim() : "";

    // DEBUG LOG
    console.log("CLIENT ID:", clientId);
    console.log("TEXT:", text);

    const client = registry[clientId];

    if (!client) {
        return res.json({ action: 'reply', text: "❌ Bot haijasajiliwa!" });
    }

    console.log("ALLOWED:", client.allowedPlugins);

    try {
        if (text.startsWith('.')) {
            const cmd = text.split(' ')[0].replace('.', '');

            console.log("COMMAND:", cmd);

            if (client.allowedPlugins.includes(cmd)) {
                try {
                    const plugin = require(`../plugins/${cmd}.js`);
                    const response = await plugin(body, sender, client);

                    if (response) {
                        return res.json(response);
                    } else {
                        return res.json({
                            action: 'reply',
                            text: '⚠️ Plugin returned nothing'
                        });
                    }
                } catch (e) {
                    return res.json({
                        action: 'reply',
                        text: `❌ Plugin load error: ${cmd}`
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
