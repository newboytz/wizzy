/**
 * TAGALL PLUGIN (English Version)
 * Optimized for QB PRO MAX Dynamic Loader
 */

module.exports.run = async (sock, m, { config, text, guard, command }) => {
    // 1. Guard System: Inahakikisha inafanya kazi kwenye Group pekee
    // Hii inatumia ule ulinzi wako ulioko kwenye mstari wa 178 wa index.js
    if (!await guard(sock, m, command, config, { groupOnly: true })) return;

    try {
        // 2. Fetch Group Participants kwa haraka
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = groupMetadata.participants;

        // 3. Prepare Message Content
        // 'text' hapa inachukua maneno yaliyoandikwa baada ya .tagall
        let userMsg = text ? text : 'Attention everyone! Please check the group.';
        let tagMsg = `*📢 QB PRO MAX - TAG ALL*\n\n`;
        tagMsg += `📝 *Message:* ${userMsg}\n\n`;

        let mentions = [];
        let list = "";

        // 4. Mentions Loop - Inatengeneza list ya majina na ID za kutag
        for (let mem of participants) {
            list += ` @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        }

        tagMsg += list;

        // 5. Send Message with Mentions
        // Inatumia sock.sendMessage kama ilivyoelekezwa kwenye index.js
        await sock.sendMessage(m.key.remoteJid, {
            text: tagMsg,
            mentions: mentions
        }, { quoted: m });

        console.log(`✅ [TAGALL] Executed successfully in ${groupMetadata.subject}`);

    } catch (err) {
        // Inarekodi kosa bila kuzima bot nzima
        console.log(`❌ TagAll Plugin Error: ${err.message}`);
    }
};
            
