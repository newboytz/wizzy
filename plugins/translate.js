module.exports = {
    run: async (sock, m, { guard, config, command, text }) => {
        let [lang, ...query] = text.split(' ');
        if (!lang || query.length === 0) return m.reply("Usage: .translate en Habari");
        m.reply(`🌍 Translating to ${lang}...`);
        // Translation API...
    }
};
