module.exports = {
    name: "getdp",
    aliases: ["gtdp", "pfp"],
    description: "Fetches user profile picture instantly",
    run: async (sock, m, { guard, config, command }) => {

        if (!await guard(sock, m, command, config, { active: true })) return;

        try {

            let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
            const targetNumber = target.split('@')[0]
            const botName = config.botName || "QB BOT"

            let ppUrl
            try {
                ppUrl = await sock.profilePictureUrl(target, 'image')
            } catch {
                ppUrl = 'https://telegra.ph/file/241fb40590a3a41a4a49c.jpg'
            }

            let caption = `🚀 *${botName} INSTANT PFP*\n\n`
            caption += `👤 User: @${targetNumber}\n`
            caption += `✅ Status: Success\n`

            await sock.sendMessage(m.key.remoteJid, {
                image: { url: ppUrl },
                caption,
                mentions: [target]
            }, { quoted: m })

        } catch (e) {
            console.log(e)
        }
    }
    }
