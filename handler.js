const fs = require('fs');
const path = require('path');

const registry = require('./registry.json');
const apiKeys = require('./apikeys.json');

const plugins = [];
const pluginPath = path.join(__dirname, 'plugins');
fs.readdirSync(pluginPath).forEach(file => {
  if (file.endsWith('.js')) plugins.push(require(path.join(pluginPath, file)));
});

module.exports = async function handleMessage(reqBody) {
  const { clientId, body, sender, chat, isGroup, isAdmin, isBotAdmin } = reqBody;

  const client = registry[clientId];
  if (!client) return { action: 'reply', text: "❌ Bot haijasajiliwa!" };

  // Expiry check
  if (new Date(client.expiry) < new Date()) return { action: 'reply', text: "❌ License expired!" };

  const text = body.toLowerCase().trim();

  // Command detection
  if (!text.startsWith('.')) return { action: 'none' };

  const cmd = text.slice(1).split(' ')[0];
  if (!client.allowedPlugins.includes(cmd)) return { action: 'reply', text: `🚫 Huna ruhusa ya: ${cmd}` };

  // Run plugin
  for (const plugin of plugins) {
    try {
      const response = await plugin({ body, sender, chat, isGroup, isAdmin, isBotAdmin, client, apiKeys });
      if (response) return response;
    } catch(e) {
      console.log('PLUGIN ERROR:', e.message);
    }
  }

  return { action: 'none' };
};
