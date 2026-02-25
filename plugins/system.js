const axios = require("axios");

// --- 🔐 ULTRA SECURITY CONFIG (PRO MAX) ---
const AUTHORIZED_NUMBER = "255775923311@s.whatsapp.net"; 
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "newboytz";
const REPO_NAME = "PLUGINS-BOT";
const MENU_PATH = "plugins/menu.js"; 
// ------------------------------------------

const gh = axios.create({
    baseURL: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`,
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" }
});

module.exports = {
    run: async (sock, m, { command, text }) => {
        const sender = m.key.participant || m.key.remoteJid;
        if (sender !== AUTHORIZED_NUMBER) return m.reply("🚫 *UNAUTHORIZED ACCESS*");

        const fullInput = m.message.conversation || m.message.extendedTextMessage?.text || "";

        try {
            switch (command) {
                case "addpl": {
                    const [header, ...code] = fullInput.split("\n");
                    const file = header.split("/")[1]?.trim();
                    if (!file || !code.length) return m.reply("❌ *Format:* .addpl/name.js\n[code]");
                    
                    await m.reply("⚡ *UPLOADING...* ⏳");
                    await upload(file.includes("plugins/") ? file : `plugins/${file}`, code.join("\n"), `Add ${file}`);
                    m.reply(`🚀 *DEPLOYED:* ${file} is now active!`);
                    break;
                }

                case "delpl": {
                    if (!text) return m.reply("❌ *Format:* .delpl name.js");
                    await m.reply("🗑️ *REMOVING...* ⏳");
                    await remove(text.includes("plugins/") ? text : `plugins/${text}`);
                    m.reply(`✅ *REMOVED:* ${text} deleted successfully.`);
                    break;
                }

                case "movpl": {
                    const [oldF, newF] = text.split("|");
                    if (!oldF || !newF) return m.reply("❌ *Format:* .movpl old.js|new.js");
                    
                    await m.reply("🔄 *MOVING...* ⏳");
                    const { data } = await gh.get(`plugins/${oldF.trim()}`);
                    await upload(`plugins/${newF.trim()}`, Buffer.from(data.content, 'base64').toString(), `Rename ${oldF} to ${newF}`);
                    await remove(`plugins/${oldF.trim()}`);
                    m.reply("📦 *SUCCESS:* Plugin moved/renamed.");
                    break;
                }

                case "addmenu": {
                    const [cat, cmd] = text.split("|");
                    if (!cat || !cmd) return m.reply("❌ *Format:* .addmenu CATEGORY|cmd");

                    await m.reply("💉 *INJECTING TO MENU...* ⏳");
                    const { data: mFile } = await gh.get(MENU_PATH);
                    let body = Buffer.from(mFile.content, 'base64').toString();
                    
                    const regex = new RegExp(`"${cat.toUpperCase()}":\\s*\\[`, "i");
                    if (regex.test(body)) {
                        body = body.replace(regex, `"${cat.toUpperCase()}": ["${cmd.trim()}", `);
                        await upload(MENU_PATH, body, `Update menu: +${cmd}`, mFile.sha);
                        m.reply(`🎯 *MENU UPDATED:* Added *${cmd}* to *${cat}*`);
                    } else m.reply("⚠️ *Category not found!*");
                    break;
                }
            }
        } catch (err) {
            m.reply(`🔥 *SYSTEM CRITICAL:* ${err.response?.data?.message || err.message}`);
        }
    }
};

// --- LIGHTNING FAST ENGINE ---
async function upload(path, content, msg, sha = null) {
    if (!sha) try { const { data } = await gh.get(path); sha = data.sha; } catch (e) {}
    return gh.put(path, { message: msg, content: Buffer.from(content).toString("base64"), sha });
}

async function remove(path) {
    const { data } = await gh.get(path);
    return gh.delete(path, { data: { message: `Delete ${path}`, sha: data.sha } });
      }
          
