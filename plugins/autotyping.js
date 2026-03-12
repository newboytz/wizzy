module.exports = {
    name: "autotyping",
    alias: ["atyping", "typing"],
    description: "Washa au zima auto-typing kwa chat hii",
    run: async (sock, m, { text, isOwner, isGroup, config }) => {
        
        // Tunahakikisha database ipo (Hii ni simple check)
        const fs = require('fs');
        let db = JSON.parse(fs.readFileSync('./database.json'));
        
        if (!db.settings) db.settings = {};
        const chatId = m.key.remoteJid;

        if (!text) return m.reply("Matumizi: *.autotyping on* au *.autotyping off*");

        if (text.toLowerCase() === "on") {
            db.settings[chatId] = { autotyping: true };
            fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
            return m.reply("✅ *Auto-Typing imewashwa!* Bot sasa itaonyesha 'typing...' kwa sekunde 4 kila sms ikifika.");
        }

        if (text.toLowerCase() === "off") {
            db.settings[chatId] = { autotyping: false };
            fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
            return m.reply("❌ *Auto-Typing imezimwa!*");
        }
    }
};
                          
