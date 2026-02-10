import registry from '../registry.json';
import apiKeys from '../apikeys.json';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Denied' });

  const { clientId, body, sender, chat, isGroup, isAdmin, isBotAdmin } = req.body;
  const text = body ? body.toLowerCase().trim() : "";

  const client = registry[clientId];
  if (!client) return res.json({ action: 'reply', text: "❌ Bot haijasajiliwa!" });

  // License expiry
  if (new Date(client.expiry) < new Date()) return res.json({ action: 'reply', text: "❌ License expired!" });

  try {
    // Antilink plugin
    if (isGroup && client.allowedPlugins.includes("antilink")) {
      const antilink = require('../plugins/antilink.js');
      const result = await antilink(body, sender, isAdmin, isBotAdmin, client);
      if (result) return res.json(result);
    }

    // Other commands
    if (text.startsWith('.')) {
      const cmd = text.slice(1).split(' ')[0];
      if (client.allowedPlugins.includes(cmd)) {
        const plugin = require(`../plugins/${cmd}.js`);
        const response = await plugin({ body, sender, chat, isGroup, isAdmin, isBotAdmin, client, apiKeys });
        return res.json(response);
      } else {
        return res.json({ action: 'reply', text: `🚫 Huna ruhusa ya: ${cmd}` });
      }
    }
  } catch (e) {
    console.log('🔥 Handler Error:', e.message);
    return res.json({ action: 'none' });
  }

  return res.json({ action: 'none' });
                                }
