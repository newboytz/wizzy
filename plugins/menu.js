module.exports = async (sock, msg, config) => {
  const text = msg.body || "";
  const prefix = config.prefix || ".";

  // Trigger menu command
  if (!text.toLowerCase().startsWith(`${prefix}menu`)) return;

  const pushName = msg.pushName || msg.sender.split('@')[0];

  const menuMessage = `
╭─〔 🔥 PRO MAX MENU 🔥 〕─⬣
│ 👤 User: ${pushName}
│ 🕒 Runtime: ${new Date().toLocaleString()}
│
│ 📌 Commands:
│ • .antilink - Antilink toggle
│ • .tiktok - TikTok download
│ • .ai - AI chat
│ • .ytdl - YouTube download
│ • .football - Football updates
╰─⬣
`;

  await sock.sendMessage(msg.chat, { text: menuMessage }, { quoted: msg });
};
