/**
 * HANDLER.JS - SMART TRAFFIC CONTROLLER
 * Inapokea ujumbe na kuita mtaalamu (plugin) husika.
 */

module.exports.run = async (m, { msgStore, pluginCache }) => {
    try {
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body = m.message.conversation || 
                     m.message.extendedTextMessage?.text || 
                     m.message.imageMessage?.caption || "";
        
        // 1. KAZI YA ANTI-DELETE (Inaita plugin ya 'antidelete')
        if (m.message?.protocolMessage?.type === 0 && config.antidelete) {
            await runSpecialPlugin("antidelete", { m, msgStore });
        }

        // 2. KAZI YA ANTI-LINK (Inaita plugin ya 'antilink')
        if (isGroup && config.antilink && body.includes("chat.whatsapp.com/")) {
            await runSpecialPlugin("antilink", { m });
        }

        // 3. KAZI YA COMMANDS (Inaita plugins kama .menu, .ai, n.k.)
        const prefix = config.prefix;
        if (body.startsWith(prefix)) {
            const command = body.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
            const text = body.trim().split(/ +/).slice(1).join(" ");
            
            // Angalia ruhusa ya mteja
            const isAllowed = config.allowedPlugins.includes("all") || config.allowedPlugins.includes(command);
            if (isAllowed) {
                await runSpecialPlugin(command, { m, text });
            }
        }

        // --- FUNCTION NDOGO YA KUVUTA PLUGINS KIOTOMATIKI ---
        async function runSpecialPlugin(name, extraData) {
            try {
                let plugin;
                if (pluginCache.has(name)) {
                    plugin = pluginCache.get(name);
                } else {
                    const res = await axios.get(`${config.cloudUrl}${name}.js`, { httpsAgent });
                    const ctx = { 
                        module: { exports: {} }, require, console, process, Buffer, setTimeout,
                        sock, axios, fs, path, config, obscure, deObscure, vm, httpsAgent
                    };
                    vm.createContext(ctx);
                    vm.runInContext(res.data, ctx);
                    plugin = ctx.module.exports;
                    pluginCache.set(name, plugin);
                }

                if (plugin && typeof plugin.run === "function") {
                    await plugin.run(sock, m, { ...extraData, config });
                }
            } catch (err) {
                // Kama plugin haipo Cloud, isilete error ya kuzima bot
                console.log(`[System] Plugin ${name} missing or error.`);
            }
        }

    } catch (e) {
        console.log("Master Handler Critical Error:", e.message);
    }
};
          
