const axios = require("axios");
const fs = require("fs");

// --- 🔐 ULTRA SECURITY CONFIG ---
const AUTHORIZED_NUMBER = "255775923311@s.whatsapp.net"; 
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "newboytz";
const REPO_NAME = "PLUGINS-BOT";
const MENU_PATH = "plugins/menu.js"; 
// ------------------------------------------

// Helpers za bot yako (Encryption)
const obscure = (text) => Buffer.from(text).toString('base64');

const gh = axios.create({
    baseURL: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`,
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" }
});

module.exports = {
    command: ["addpl", "delpl", "addmenu", "refresh"],
    run: async (sock, m, { command, text, localStore, STORE_FILE, pluginCache }) => {
        // 1. SECURITY CHECK (Inatambua DM na Group)
        const sender = m.key.fromMe ? sock.user.id.split(':')[0] + "@s.whatsapp.net" : (m.key.participant || m.key.remoteJid);
        if (!sender.includes(AUTHORIZED_NUMBER.split('@')[0])) return;

        const fullInput = m.body || m.message?.conversation || m.message?.extendedTextMessage?.text || "";

        try {
            switch (command) {
                case "addpl": {
                    const [header, ...code] = fullInput.split("\n");
                    const file = header.split("/")[1]?.trim();
                    const pluginCode = code.join("\n").trim();
                    if (!file || !pluginCode) return m.reply("❌ *Format:* .addpl/name.js\n[code]");
                    
                    await m.reply("⚡ *UPLOADING TO GITHUB & LOCAL CACHE...*");
                    
                    // A. Update GitHub
                    await upload(`plugins/${file}`, pluginCode, `Add ${file}`);
                    
                    // B. Update Local Encrypted Store (Hapa ndipo bot inasoma)
                    localStore[file.replace(".js", "")] = obscure(pluginCode);
                    fs.writeFileSync(STORE_FILE, JSON.stringify(localStore));
                    
                    // C. Clear Cache ili isome code mpya
                    pluginCache.delete(file.replace(".js", ""));

                    m.reply(`🚀 *SUCCESS:* ${file} is now LIVE and cached!`);
                    break;
                }

                case "delpl": {
                    if (!text) return m.reply("❌ *Format:* .delpl name.js");
                    const fileName = text.replace(".js", "");
                    
                    await m.reply(`🗑️ *DELETING ${text}...*`);
                    try { await remove(`plugins/${text}`); } catch (e) {}
                    
                    delete localStore[fileName];
                    fs.writeFileSync(STORE_FILE, JSON.stringify(localStore));
                    pluginCache.delete(fileName);
                    
                    m.reply(`✅ *REMOVED:* ${text} deleted from everywhere.`);
                    break;
                }

                case "addmenu": {
                    const [cat, cmd] = text.split("|");
                    if (!cat || !cmd) return m.reply("❌ *Format:* .addmenu CATEGORY|cmd");

                    await m.reply("💉 *INJECTING MENU...*");
                    const { data: mFile } = await gh.get(MENU_PATH);
                    let body = Buffer.from(mFile.content, 'base64').toString();
                    
                    // Inatafuta "CATEGORY": [ bila kujali herufi kubwa/ndogo
                    const regex = new RegExp(`"${cat}":\\s*\\[`, "i");
                    if (regex.test(body)) {
                        body = body.replace(regex, `"${cat}": ["${cmd.trim()}", `);
                        await upload(MENU_PATH, body, `Update menu: +${cmd}`, mFile.sha);
                        
                        // Update local store kwa ajili ya menu.js pia
                        localStore["menu"] = obscure(body);
                        fs.writeFileSync(STORE_FILE, JSON.stringify(localStore));
                        pluginCache.delete("menu");

                        m.reply(`🎯 *MENU UPDATED:* Added *${cmd}* to *${cat}*`);
                    } else m.reply("⚠️ *Category not found in menu.js*");
                    break;
                }

                case "refresh": {
                    // Inafuta cache zote, inalazimisha bot isome upya kutoka GitHub/LocalStore
                    pluginCache.clear();
                    m.reply("🔄 *SYSTEM REFRESHED:* All plugin caches cleared.");
                    break;
                }
            }
        } catch (err) {
            m.reply(`🔥 *SYSTEM ERROR:* ${err.response?.data?.message || err.message}`);
        }
    }
};

async function upload(path, content, msg, sha = null) {
    if (!sha) try { const { data } = await gh.get(path); sha = data.sha; } catch (e) {}
    return gh.put(path, { message: msg, content: Buffer.from(content).toString("base64"), sha });
}

async function remove(path) {
    const { data } = await gh.get(path);
    return gh.delete(path, { data: { message: `Delete ${path}`, sha: data.sha } });
}
