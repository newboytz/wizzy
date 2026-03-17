module.exports = {
  command: 'clear',
  aliases: ['clr', 'clean'],
  category: 'owner',
  description: 'Clear bot messages from chat',
  usage: '.clear',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const sent = await sock.sendMessage(chatId, { 
        text: 'Clearing bot messages...'
      });

      // subiri kidogo kisha delete
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sock.sendMessage(chatId, { delete: sent.key });

    } catch (error) {
      console.error('Error clearing messages:', error);
      await sock.sendMessage(chatId, { 
        text: 'An error occurred while clearing messages.'
      }, { quoted: message });
    }
  }
};