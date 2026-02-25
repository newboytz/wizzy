module.exports = {
run: async (sock, m, { guard, config, command, text, isOwner }) => {
    // 1️⃣ Guard System - hakikisha ni group
    const canRun = await guard(sock, m, command, config, { groupOnly: true });
    if (!canRun) return;

    const from = m.key.remoteJid;

    // 2️⃣ Owner Reference kutoka config
    // Ikiwa unataka session ya bot pia iende, unaweza ku-add sock.user.id
    const ownerNumbers = config.ownerNumber.map(num => num.includes("@s.whatsapp.net") ? num : num + "@s.whatsapp.net");

    // 3️⃣ Pata metadata ya group
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    // 4️⃣ Angalia kama ownerNumbers yoyote ipo kama admin
    const isBotAdmin = participants.some(p => ownerNumbers.includes(p.id) && p.admin !== null);

    if (!isBotAdmin) {
        return sock.sendMessage(from, {
            text: "❌ *PERMISSION DENIED:* My owner number must be an *ADMIN* in this group to perform this action."
        }, { quoted: m });
    }

    // 5️⃣ Tafuta nani anapaswa kukatwa
    let users = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (m.message.extendedTextMessage?.contextInfo?.participant) {
        users.push(m.message.extendedTextMessage.contextInfo.participant);
    }

    if (users.length === 0) {
        return sock.sendMessage(from, { text: "🔍 *USAGE:* Tag a user or reply to their message to kick them." }, { quoted: m });
    }

    const target = users[0];

    // 6️⃣ Protection: usikate owner au mwenyewe
    if (ownerNumbers.includes(target)) {
        return sock.sendMessage(from, { text: "🛡️ I cannot remove the owner from the group." }, { quoted: m });
    }

    // 7️⃣ Execution - kick user
    try {
        await sock.groupParticipantsUpdate(from, [target], "remove");

        await sock.sendMessage(from, {
            text: `🚀 *SYSTEM PURGE:* User @${target.split('@')[0]} has been kicked out!`,
            mentions: [target]
        }, { quoted: m });

    } catch (err) {
        await sock.sendMessage(from, { text: `❌ *FAILED:* Error occurred while trying to kick the user.` }, { quoted: m });
        console.log("Kick error:", err);
    }
}
};
