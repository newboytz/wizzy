const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const Jimp = require('jimp')

module.exports = {
  command: 'blur',
  aliases: ['blurimg', 'blurpic'],
  category: 'tools',
  description: 'Apply a blur effect to an image',
  usage: '.blur (reply to an image or send image with caption)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    try {
      let imageBuffer;

      if (quotedMessage?.imageMessage) {
        const quoted = { message: { imageMessage: quotedMessage.imageMessage } };
        imageBuffer = await downloadMediaMessage(quoted, 'buffer', {}, {});
      } 
      else if (message.message?.imageMessage) {
        imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {});
      } 
      else {
        await sock.sendMessage(chatId, { 
          text: 'Please reply to an image or send an image with caption `.blur`' 
        }, { quoted: message });
        return;
      }

      const img = await Jimp.read(imageBuffer)

      img.scaleToFit(800, 800)

      img.blur(10)

      const blurredImage = await img.getBufferAsync(Jimp.MIME_JPEG)

      await sock.sendMessage(chatId, {
        image: blurredImage,
        caption: '✨ *Image Blurred Successfully!*',
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363319098372999@newsletter',
            newsletterName: 'MEGA MD',
            serverMessageId: -1
          }
        }
      }, { quoted: message });

    } catch (error) {
      console.error('Error in blur command:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to blur image. Please try again later.' 
      }, { quoted: message });
    }
  }
};
