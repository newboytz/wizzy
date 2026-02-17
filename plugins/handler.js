module.exports.run = async () => {
    try {
        if (m.key.remoteJid === "status@broadcast") return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        const body =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            m.message.imageMessage?.caption ||
            "";

        // ===== ANTI DELETE =====
        if (m.message?.protocolMessage?.type === 0 && config.antidelete) {
            let deleted = msgStore[m.message.protocolMessage.key.id];
            if (deleted) {
                await sock.sendMessage(from, {
                    text: `🚫 Anti-Delete:\n${JSON.stringify(deleted.message, null, 2)}`
                });
            }
            return;
        }

        if (!body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const text = args.join(" ");

        const isAllowed =
            config.allowedPlugins.includes("all") ||
            config.allowedPlugins.includes(command);

        if (!isAllowed) return;

        let plugin;
        let pluginCodeRaw;
        let localStore = {};

        if (require("fs").existsSync(STORE_FILE)) {
            localStore = JSON.parse(require("fs").readFileSync(STORE_FILE, "utf8"));
        }

        // RAM
        if (pluginCache.has(command)) {
            plugin = pluginCache.get(command);
        }
        // FILE
        else if (localStore[command]) {
            pluginCodeRaw = deObscure(localStore[command]);
        }
        // CLOUD
        else {
            const res = await axios.get(`${config.cloudUrl}${command}.js`);
            pluginCodeRaw = res.data;
            localStore[command] = obscure(pluginCodeRaw);
            require("fs").writeFileSync(STORE_FILE, JSON.stringify(localStore));
        }

        if (!plugin && pluginCodeRaw) {
            const ctx = {
                module: { exports: {} },
                require,
                console,
                process,
                Buffer,
                setTimeout
            };
            vm.createContext(ctx);
            vm.runInContext(pluginCodeRaw, ctx);
            plugin = ctx.module.exports;
            pluginCache.set(command, plugin);
        }

        if (plugin && typeof plugin.run === "function") {
            await plugin.run(sock, m, {
                config,
                text,
                msgStore
            });
        }

    } catch (e) {
        console.log("Handler error:", e.message);
    }
};
