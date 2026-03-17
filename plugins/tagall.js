module.exports = {
  command: 'tagall',
  aliases: ['everyone', 'all'],
  category: 'admin',
  description: 'Tag all group members with their usernames',
  usage: '.tagall',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants;

      if (!participants || participants.length === 0) {
        await sock.sendMessage(chatId, { 
          text: 'No participants found in the group.',
        }, { quoted: message });
        return;
      }
      
      let messageText = '🔊 *Hello Everyone:*\n\n';
      participants.forEach(participant => {
        messageText += `@${participant.id.split('@')[0]}\n`;
      });
      
      await sock.sendMessage(chatId, {
        text: messageText,
        mentions: participants.map(p => p.id),
      });

    } catch (error) {
      console.error('Error in tagall command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to tag all members.',
      }, { quoted: message });
    }
  }
};
