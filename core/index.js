// ================= IMPORT MODULES =================
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode,
    getContentType
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const vm = require("vm");
const pino = require("pino");
const axios = require("axios");
const https = require("https");
const readline = require("readline");
const fs = require("fs"); 
const path = require("path");
const config = require("./config");


// --- 🌐 HARDCODED SYSTEM LINKS ---
const apiURL = "https://plugins-bot.vercel.app/api/verify";
const cloudUrl = "https://plugins-bot.vercel.app/plugins/";

// Rangi za Terminal (Unyama Mode)
const rc = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// ================= 🍃 MONGODB SETUP & MODELS =================
const mongoURI = process.env.MONGO_URL; 
if (mongoURI) {
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // Ikikosa ndani ya sekunde 5 inapuuza, haikwami
        connectTimeoutMS: 10000
    }).then(() => {
        console.log(`${rc.green}🍃 [DATABASE] MongoDB Connected Successfully!${rc.reset}`);
        refreshAdminConfig();
    }).catch(err => {
        console.log(`${rc.red}❌ Mongo Connection Error: ${err.message}${rc.reset}`);
    });
}

const AdminConfigSchema = new mongoose.Schema({
    system_id: { type: String, default: "GLOBAL_CONTROL" },
    base_api_keys: Object,
    global_settings: Object,
    ai_prompts: Object,
    api_urls: Object
}, { strict: false });
const AdminConfig = mongoose.model('AdminConfig', AdminConfigSchema, 'adminConfig');

const UserRegisterSchema = new mongoose.Schema({}, { strict: false });
const UserRegister = mongoose.model('UserRegister', UserRegisterSchema, 'userRegister');

global.adminConfig = {}; 
async function refreshAdminConfig() {
    try {
        if (mongoose.connection.readyState === 1) {
            const data = await AdminConfig.findOne({ system_id: "GLOBAL_CONTROL" }).maxTimeMS(3000);
            if (data) {
                global.adminConfig = data.toObject();
                console.log(`${rc.cyan}🔄 [SYNC] Admin Config Refreshed${rc.reset}`);
            }
        }
    } catch (e) { console.log("Config Sync Error:", e.message); }
}
setInterval(refreshAdminConfig, 5 * 60 * 1000);

// 1️⃣ [STO] RAM STORAGE SYSTEM (Max 100 Messages, 24h Auto-Delete)
const ramStore = new Map();
const addToStore = (id, data) => {
    if (ramStore.size >= 100) {
        const firstKey = ramStore.keys().next().value;
        ramStore.delete(firstKey);
    }
    ramStore.set(id, { data, time: Date.now() });
    setTimeout(() => { ramStore.delete(id); }, 24 * 60 * 60 * 1000);
};

// 2️⃣ [DB] DATABASE LOGIC (Local JSON Storage)
const DB_PATH = path.join(__dirname, "database.json");
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, groups: {}, settings: {} }, null, 2));
}
let db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// 🛠️ GROUP METADATA CACHE (Fix for Rate-Overlimit 429)
const groupCache = new Map();

// Jina la faili la siri ambapo plugins zote zitakaa
const STORE_FILE = path.join(__dirname, ".system_data.enc");

// Agent ya kasi kwa ajili ya plugins
const httpsAgent = new https.Agent({ keepAlive: true });

// ================= HELPERS FOR ENCRYPTION =================
const obscure = (text) => Buffer.from(text).toString('base64');
const deObscure = (text) => Buffer.from(text, 'base64').toString('utf8');

// ================= VERIFY SYSTEM (Bypass Added) =================
async function verifyClient(config) {
    try {
        process.stdout.write(`${rc.yellow}🔍 Inakagua usajili wa ${rc.bold}${config.clientId}${rc.reset}${rc.yellow}...${rc.reset}\r`);
        
        let clientData = null;

        // 1. Kwanza ijaribu Mongo kama ipo
        if (mongoose.connection.readyState === 1) {
            const allUsers = await UserRegister.findOne({}).maxTimeMS(3000);
            if (allUsers) clientData = allUsers[config.clientId];
        }

        // 2. Kama Mongo haipo, tumia link yako ya asili
        if (!clientData) {
            try {
                const verifyRes = await axios.get(`${apiURL}?clientId=${config.clientId}`);
                const rawData = verifyRes.data?.data;
                clientData = rawData?.[config.clientId] ? rawData[config.clientId] : rawData;
            } catch (apiErr) {
                // HAPA NDIPO ENOTFOUND INAZUIWA (Fail-safe Bypass)
                console.log(`\n${rc.yellow}⚠️ API ya nje imegoma, naruhusu bot iwake kwa usalama wako...${rc.reset}`);
                return { success: true, allowedPlugins: ["all"], clientData: { name: config.ownerName || "Owner", plan: "Dev Bypass" } };
            }
        }

        if (!clientData || clientData.status !== "active") {
            // Kama wewe ni owner ruhusu hata kama database imegoma
            if(config.ownerNumber && config.ownerNumber.includes(config.clientId)) {
                 return { success: true, allowedPlugins: ["all"], clientData: { name: config.ownerName, plan: "Owner Mode" } };
            }
            console.log(`\n${rc.red}❌ Client siyo active (Status: ${clientData?.status || 'Unknown'}). Bot inazimika.${rc.reset}`);
            return { success: false };
        }

        console.log(`\n${rc.green}${rc.bold}✅ VERIFY SUCCESSFULLY 💯${rc.reset}`);
        console.log(`${rc.cyan}👤 Owner: ${rc.bold}${clientData.name || config.ownerName}${rc.reset}`);
        console.log(`${rc.cyan}🛡️ Plan: ${rc.bold}${clientData.plan || 'Premium'}${rc.reset}\n`);

        return {
            success: true,
            allowedPlugins: Array.isArray(clientData.plugins) ? clientData.plugins : ["all"],
            clientData
        };
    } catch (err) {
        console.log(`\n${rc.red}❌ Verification Error: ${err.message}. Bot inawaka kinguvu.${rc.reset}`);
        return { success: true, allowedPlugins: ["all"] }; // Fail-safe: Bot haiwezi kujizima kizembe
    }
}

// ================= START BOT =================
const pluginCache = new Map();
const msgStore = {}; 
let localStore = {};
      // --- 🛡️ GUARD SYSTEM PRO MAX (Hardcoded) ---
const guard = async (sock, m, command, config, options = {}) => {
    // 1. Tunapokea options (privateOnly imechukua nafasi ya dmOnly)
    const { groupOnly = false, privateOnly = false } = options;
    
    // 2. Logic zako za utambulisho (Sijafuta hata nukta moja)
    const sender = m.key.participant || m.key.remoteJid;
    const senderNumber = sender.replace(/[^0-9]/g, '');
    const isGroup = m.key.remoteJid.endsWith('@g.us');
    
    // 3. Logic za kumtambua Owner na Public Commands
    const isOwner = config.ownerNumber && config.ownerNumber.map(v => v.replace(/[^0-9]/g, '')).includes(senderNumber);
    const isPublic = config.publicCommands && config.publicCommands.includes(command);

    // --- 🛡️ PRO MAX FILTERS ---

    // A. Kagua kama mtumiaji anaruhusiwa (Owner au Public)
    if (!isOwner && !isPublic) {
        await sock.sendMessage(m.key.remoteJid, { text: "❌ This command is restricted to the bot owner." }, { quoted: m });
        return false;
    }

    // B. Group Only Logic: Inazuia amri za group zisifanye kazi DM
    if (groupOnly && !isGroup) {
        await sock.sendMessage(m.key.remoteJid, { text: "❌ This command can only be used in groups." }, { quoted: m });
        return false;
    }

    // C. Private Only Logic: Inaruhusu DM kwa kila mtu (kama ni Public) au Owner pekee
    if (privateOnly && isGroup) {
        await sock.sendMessage(m.key.remoteJid, { text: "❌ This command works only in private chat." }, { quoted: m });
        return false;
    }

    return true; // Akipita hapa, amri inatekelezwa
};
async function startBot() {
    console.clear();
    console.log(`${rc.magenta}${rc.bold}==========================================`);
    console.log(`🚀 ${config.botName.toUpperCase()} IS STARTING PRO MAX...`);
    console.log(`==========================================${rc.reset}\n`);

    if (fs.existsSync(STORE_FILE)) {
        try {
            localStore = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
        } catch (e) { localStore = {}; }
    }

    const verify = await verifyClient(config);
    if (!verify.success) process.exit(0);

    config.allowedPlugins = verify.allowedPlugins;

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        generateHighQualityLinkPreview: true,
        shouldSyncHistoryMessage: () => false
    });

    sock.ev.on("creds.update", saveCreds);

    // 3️⃣ PAIRING LOGIC
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        console.log(`${rc.yellow}📝 PHONE NUMBER PAIRING...${rc.reset}`);
        rl.question("Weka namba (Mfano: 255775923311): ", async (phoneNumber) => {
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            let code = await sock.requestPairingCode(phoneNumber);
            console.log(`\n${rc.green}🔥 PAIRING CODE: ${rc.bold}${code}${rc.reset}\n`);
            rl.close();
        });
    }

                     // 4️⃣ MESSAGE HANDLER
sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
         const m = chatUpdate.messages[0];
        // Badala ya: if (!m || !m.message) return;
         if (!m) return; 



        // 🌟 PRO MAX AUTO-STATUS VIEW (Top Priority)
        if (m.key && m.key.remoteJid === 'status@broadcast') {
            // Tunahakikisha tunasoma database kwa usahihi
            const autoView = db.settings?.autoViewStatus || config.autoViewStatus || false;
            
            if (autoView === true) {
                // Delay ya sekunde 3 ili usipigwe ban (Human-like)
                await new Promise(resolve => setTimeout(resolve, 3000));
                try {
                    await sock.readMessages([m.key]); 
                    const sName = m.pushName || "WhatsApp User";
                    console.log(`${rc.green}✨ [STATUS VIEWED] From: ${sName}${rc.reset}`);
                } catch (err) {
                    console.log(`${rc.red}❌ Status Error: ${err.message}${rc.reset}`);
                }
            }
            return; // Inatoka hapa ili isiprosesi status kama ujumbe wa kawaida
        }

        // --- FILTERS ZA KAWAIDA ---
        if (chatUpdate.type !== 'notify') return;
        if (!m.message) return; 
        const messageTime = m.messageTimestamp;
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - messageTime > 60) return; 

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const type = getContentType(m.message);
        const sender = isGroup ? m.key.participant : m.key.remoteJid;
        const senderNumber = sender ? sender.replace(/[^0-9]/g, '') : '';
        const senderName = m.pushName || "user";

        // Save message to RAM for anti-delete
        if (m.key && m.key.id) {
            msgStore[m.key.id] = m;
            addToStore(m.key.id, m);
            setTimeout(() => { delete msgStore[m.key.id]; }, 12 * 60 * 60 * 1000);
        }

        // ================= 🛡️ PRO MAX ANTI-DELETE ULTRA (INTERNATIONAL) =================
if (m.message?.protocolMessage && (m.message.protocolMessage.type === 0 || m.message.protocolMessage.type === 14)) {
    const deletedKey = m.message.protocolMessage.key;
    const storeData = ramStore.get(deletedKey.id); 

    if (storeData) {
        const originalMsg = storeData.data;
        const from = originalMsg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // 👤 Participant Logic
        const senderMsg = originalMsg.key.participant || from; 
        const deletor = m.key.participant || from; 
        
        // 🛠️ Unpack Message (Support for ViewOnce/Ephemeral)
        let msg = originalMsg.message;
        if (msg.ephemeralMessage) msg = msg.ephemeralMessage.message;
        if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;

        // 📝 Content & Type Logic
        const type = Object.keys(msg)[0];
        const content = msg.conversation 
                        || msg.extendedTextMessage?.text 
                        || msg.imageMessage?.caption 
                        || msg.videoMessage?.caption 
                        || "*(No Text Content)*";

        // 🧠 Smart Filter: Hapa ndio utundu upo (Case-Insensitive)
        const isText = (type === 'conversation' || type === 'extendedTextMessage');

        // 🏗️ Build High-End Notification
        let notification = `*━─┈❮ 🚨 ANTI-DELETE  ❯┈─━*\nn`;
        notification += `✍️ *Author:* ${originalMsg.pushName || 'User'}\n`;
        notification += `👤 *Sender ID:* @${senderMsg.split('@')[0]}\n`;
        
        if (senderMsg !== deletor) {
            notification += `🗑️ *Deleted By:* @${deletor.split('@')[0]} (Admin)\n`;
        }
        
        notification += `📍 *Location:* ${isGroup ? 'Group Chat' : 'Private Chat'}\n`;
        if (isGroup) {
            const groupName = groupCache.get(from) || "Unknown Group";
            notification += `💬 *Group Name:* ${groupName}\n`;
        }
        
        notification += `🕒 *Time:* ${new Date().toLocaleTimeString()}\n`;
        notification += `📜 *Type:* ${type.replace('Message', '').toUpperCase()}\n\n`;

        // 🚀 MGANYAWANYO WA KUTUMA (PRO MAX LOGIC)
        const ownerJid = config.ownerNumber[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        try {
            if (isText) {
                // KAMA NI SMS: Inatuma ujumbe mmoja tu wenye maandishi (Haitoforward)
                notification += `📝 *Content:* \n${content}`;
                await sock.sendMessage(ownerJid, { text: notification, mentions: [senderMsg, deletor] });
            } 
            else {
                // KAMA NI MEDIA: Inatuma maelezo kisha inatuma na hiyo Media (Forward)
                if (content !== "*(No Text Content)*") notification += `📝 *Caption:* ${content}\n\n`;
                notification += `*--- DELETED MEDIA BELOW ---*`;
                
                // Tuma Alert kwanza
                await sock.sendMessage(ownerJid, { text: notification, mentions: [senderMsg, deletor] });
                
                // Tuma Media kwa Forward (Hapa ndio picha/video inapokuja)
                await sock.sendMessage(ownerJid, { forward: originalMsg }, { quoted: originalMsg });
            }
            
            console.log(`${rc.cyan}🔥 [PRO MAX] Anti-delete: Sent to DM as ${isText ? 'TEXT' : 'MEDIA'}${rc.reset}`);
        } catch (e) {
            console.log(`${rc.red}❌ Pro-Delete Error: ${e.message}${rc.reset}`);
        }
    }
}
// ==============================================================================



        // Group metadata cache
        let groupName = "Private Chat";
        if (isGroup) {
            if (groupCache.has(from)) {
                groupName = groupCache.get(from);
            } else {
                try {
                    const metadata = await sock.groupMetadata(from, false);
                    groupName = metadata.subject;
                    groupCache.set(from, groupName);
                    setTimeout(() => groupCache.delete(from), 60 * 60 * 1000);
                } catch {
                    groupName = "Group Chat";
                }
            }
        }

        const body = m.message.conversation 
                    || m.message.extendedTextMessage?.text 
                    || m.message.imageMessage?.caption 
                    || "";

        // --- LOG ---
        console.log(`${rc.blue}---------- NEW MESSAGE ----------${rc.reset}`);
        console.log(`${rc.cyan}🕒 Time: ${new Date().toLocaleTimeString()}`);
        console.log(`${rc.cyan}👥 Group: ${rc.bold}${groupName}${rc.reset}`);
        console.log(`${rc.green}👤 From: ${rc.bold}${senderName}${rc.reset} (${senderNumber})`);
        console.log(`${rc.magenta}📜 Type: ${type}`);
        console.log(`${rc.yellow}💬 Msg: ${rc.bold}${body || '(Media/Protocol)'}${rc.reset}`);

                // --- Parse command & args safely ---
        const isCmd = body.startsWith(config.prefix);
        const command = isCmd ? body.trim().split(/ +/)[0].toLowerCase().slice(config.prefix.length) : null;
        const text = isCmd ? body.trim().split(/ +/).slice(1).join(" ") : body;
        const args = body.trim().split(/ +/).slice(1);


        // --- AI / CHATBOT LOGIC ---
        // Kama siyo command, iende kwenye AI yako (Chatbot)
        if (!isCmd) {
            const aiPluginName = "chatbot"; // Jina la faili lako la AI kule Cloud
            try {
                let aiP = pluginCache.get(aiPluginName);
                if (!aiP) {
                    const res = await axios.get(`${cloudUrl}${aiPluginName}.js`, { httpsAgent });
                    const ctx = { module: { exports: {} }, require, console, process, Buffer, setTimeout };
                    vm.createContext(ctx);
                    vm.runInContext(res.data, ctx);
                    aiP = ctx.module.exports;
                    pluginCache.set(aiPluginName, aiP);
                }
                if (aiP) await aiP.run(sock, m, { config, text, localDB: db });
            } catch (e) { /* Kimya */ }
            return; // Usiendelee chini kama siyo command
        }


        // --- Determine if sender is owner ---
        const isOwner = config.ownerNumber
            ? config.ownerNumber.some(v => v.replace(/[^0-9]/g, '') === senderNumber)
            : false;

        // --- Fetch user data from MongoDB ---
        let userData = null;
        try {
            if (mongoose.connection.readyState === 1) {
                const allUsersDoc = await UserRegister.findOne({}).maxTimeMS(2000);
                if (allUsersDoc) userData = allUsersDoc[senderNumber];
            }
        } catch (dbErr) {
            // Ignore DB errors, fallback to local rules
        }

        // --- m.reply helper ---
        m.reply = async (content) => {
            return sock.sendMessage(from, { text: content }, { quoted: m });
        };

        // --- DYNAMIC PLUGIN LOADER ---
        let plugin;
        let pluginCodeRaw;

        if (pluginCache.has(command)) {
            plugin = pluginCache.get(command);
            process.stdout.write(`${rc.green}⚡ [RAM] Executing ${command}...${rc.reset}\r`);
        } else {
            if (localStore[command]) {
                process.stdout.write(`${rc.magenta}🔒 [SECURE] Loading ${command}...${rc.reset}\r`);
                pluginCodeRaw = deObscure(localStore[command]);
            } else {
                try {
                    const response = await axios.get(`${cloudUrl}${command}.js`, { httpsAgent });
                    pluginCodeRaw = response.data;

                    if (typeof pluginCodeRaw === "string" && !pluginCodeRaw.includes("<!DOCTYPE html>")) {
                        localStore[command] = obscure(pluginCodeRaw);
                        fs.writeFileSync(STORE_FILE, JSON.stringify(localStore));
                    } else return; // Plugin not found
                } catch {
                    return; // Silent fail on network error
                }
            }

            const scriptContext = {
                module: { exports: {} },
                require: (name) => {
                    const libs = ['axios', 'pino', 'fs', 'path', 'os', 'util', 'https', '@whiskeysockets/baileys'];
                    if (libs.includes(name)) return require(name);
                    throw new Error(`Forbidden: ${name}`);
                },
                console, process, Buffer, setTimeout
            };

            vm.createContext(scriptContext);
            vm.runInContext(pluginCodeRaw, scriptContext);
            plugin = scriptContext.module.exports;
            pluginCache.set(command, plugin);
        }

        // --- EXECUTE PLUGIN ---
        if (plugin && typeof plugin.run === "function") {
            const isAllowed = config.allowedPlugins.includes("all") || config.allowedPlugins.includes(command);
            if (!isAllowed && !isOwner) return;

            try {
                await plugin.run(sock, m, { 
                    clientPerms: { allowedPlugins: config.allowedPlugins }, 
                    config, 
                    localDB: db, 
                    text, 
                    saveDB, 
                    ramStore,
                    adminConfig: global.adminConfig,
                    userData,
                    isOwner,
                    command,
                    guard,
                    args,
                    pluginCache,
                    localStore,
                    STORE_FILE,
                    fs
                });
                console.log(`${rc.green}✅ [DONE] ${command} executed.${rc.reset}`);
            } catch (err) {
                console.log(`${rc.red}❌ Plugin Error (${command}): ${err.message}${rc.reset}`);
            }
        }

    } catch (e) {
        console.log(`${rc.red}⚠️ Warning: ${e.message}${rc.reset}`);
    }
});

    // 🌐 CONNECTION UPDATE
    sock.ev.on("connection.update", (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === "close") {
            if ((lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log(`${rc.red}🔄 Connection lost. Reconnecting...${rc.reset}`);
                startBot();
            }
        } else if (connection === "open") {
            console.log(`\n${rc.green}${rc.bold}✨✨ ${config.botName} IS ONLINE (PRO MAX) ✨✨${rc.reset}\n`);
        }
    });
}

startBot();
