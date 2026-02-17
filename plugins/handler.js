// ================= HANDLER.JS =================
module.exports.run = async () => {
    try {
        // Ignore broadcast status messages
        if (m.key.remoteJid === "status@broadcast") return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        // ===== EXTRACT BODY =====
        const body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            "";

        // ===== ANTI-DELETE =====
        if (m.message?.protocolMessage?.type === 0 && config.antidelete) {
            const deleted = msgStore[m.message.protocolMessage.key.id];
            if (deleted) {
                await sock.sendMessage(from, {
                    text: `🚫 Anti-Delete:\n${JSON.stringify(deleted.message, null, 2)}`
                });
            }
            return;
        }

        if (!body.startsWith(config.prefix)) return;

        // ===== PARSE COMMAND =====
        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase() || "";
        const text = args.join(" ");

        // ===== SAFE ALLOWED PLUGINS CHECK =====
        const allowed = Array.isArray(config.allowedPlugins) ? config.allowedPlugins : [];
        const isAllowed = allowed.includes("all") || allowed.includes(command);

        if (!isAllowed) {
            console.log(`🚫 [DENIED] No permission for: ${command}`);
            return;
        }

        // ===== LOAD LOCAL STORE =====
        let plugin;
        let pluginCodeRaw;
        let localStore = {};
        const fs = require("fs");

        if (fs.existsSync(STORE_FILE)) {
            try {
                localStore = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
            } catch { localStore = {}; }
        }

        // ===== RAM CACHE =====
        if (pluginCache.has(command)) {
            plugin = pluginCache.get(command);
        }
        // ===== LOCAL FILE =====
        else if (localStore[command]) {
            pluginCodeRaw = deObscure(localStore[command]);
        }
        // ===== CLOUD =====
        else {
            const res = await axios.get(`${config.cloudUrl}${command}.js`);
            pluginCodeRaw = res.data;

            if (typeof pluginCodeRaw === "string" && !pluginCodeRaw.includes("<!DOCTYPE html>")) {
                localStore[command] = obscure(pluginCodeRaw);
                fs.writeFileSync(STORE_FILE, JSON.stringify(localStore));
            } else {
                console.log(`❌ Plugin ${command} not found on cloud!`);
                return;
            }
        }

        // ===== EXECUTE PLUGIN =====
        if (!plugin && pluginCodeRaw) {
            const ctx = {
                module: { exports: {} },
                require,
                console,
                process,
                Buffer,
                setTimeout,
                vm
            };

            vm.createContext(ctx);
            vm.runInContext(pluginCodeRaw, ctx);
            plugin = ctx.module.exports;
            pluginCache.set(command, plugin);
        }

        // ===== RUN PLUGIN =====
        if (plugin && typeof plugin.run === "function") {
            await plugin.run(sock, m, {
                config,
                text,
                msgStore
            });
            console.log(`✅ [DONE] ${command} executed`);
        }

    } catch (e) {
        console.log("Handler error:", e.message);
    }
};
