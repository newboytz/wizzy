/**
 * HANDLER.JS - AKILI KUU (CLOUD)
 */
module.exports.run = async (m, { msgStore, pluginCache }) => {
    try {
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
        const sender = isGroup ? m.key.participant : from;

        // 1. LOG YA TERMINAL
        console.log(`\x1b[36m[MSG]\x1b[0m ${isGroup ? 'Group' : 'Private'}: ${body.substring(0, 20)}`);

        // 2. ANTI-DELETE
        if (m.message?.protocolMessage?.type === 0 && config.antidelete) {
            const key = m.message.protocolMessage.key;
            const old = msgStore[key.id];
            if (old) {
                const text = old.message.conversation || old.message.extendedTextMessage?.text || "Picha/Video";
                await sock.sendMessage(from, { text: `🛡️ *ANTI-DELETE*\n\n👤 @${key.participant.split("@")[0]}\n💬 Msg: ${text}`, mentions: [key.participant]}, { quoted: old });
            }
        }

        // 3. ANTI-LINK
        if (isGroup && config.antilink && body.includes("chat.whatsapp.com/")) {
            const groupMetadata = await sock.groupMetadata(from);
            const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
            if (!isAdmin) {
                await sock.sendMessage(from, { delete: m.key });
                await sock.groupParticipantsUpdate(from, [sender], "remove");
                return;
            }
        }

        // 4. COMMAND LOADER
        if (body.startsWith(config.prefix)) {
            const cmdName = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            
            if (config.allowedPlugins.includes("all") || config.allowedPlugins.includes(cmdName)) {
                let plugin;
                if (pluginCache.has(cmdName)) {
                    plugin = pluginCache.get(cmdName);
                } else {
                    const res = await axios.get(`${config.cloudUrl}${cmdName}.js`, { httpsAgent });
                    const pCtx = { 
                        module: { exports: {} }, require, console, process, Buffer, setTimeout,
                        sock, axios, config, vm, httpsAgent
                    };
                    vm.createContext(pCtx);
                    vm.runInContext(res.data, pCtx);
                    plugin = pCtx.module.exports;
                    pluginCache.set(cmdName, plugin);
                }
                if (plugin) await plugin.run(sock, m, { text, config });
            }
        }
    } catch (e) { console.log("Handler Error:", e.message); }
};
            
