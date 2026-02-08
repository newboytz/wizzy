// api/process.js
export default async function handler(req, res) {
    // Ruhusu tu maombi ya POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { clientId, command, text } = req.body;

    // ---------------------------------------------------------
    // 1. DATABASE YA WATEJA (Simamia hapa)
    // ---------------------------------------------------------
    const wateja = {
        "TZ-001": { name: "Amos", level: "VIP", active: true },
        "TZ-002": { name: "Kaka Mega", level: "Standard", active: true },
        "TZ-003": { name: "Mteja Mpya", level: "VIP", active: false } // Huyu hawezi kutumia bot mpaka uweke true
    };

    const user = wateja[clientId];

    // ---------------------------------------------------------
    // 2. ULINZI WA ID (Security Gate)
    // ---------------------------------------------------------
    if (!user) {
        return res.json({ action: 'reply', data: "❌ ID yako haijasajiliwa kwenye mfumo wetu!" });
    }

    if (!user.active) {
        return res.json({ action: 'reply', data: "⚠️ Huduma yako imesitishwa. Tafadhali lipia upya!" });
    }

    // ---------------------------------------------------------
    // 3. PLUGINS LOGIC (Ujuzi wa Bot)
    // ---------------------------------------------------------
    switch (command.toLowerCase()) {
        
        case 'gpt':
        case 'ai':
            if (!text) return res.json({ action: 'reply', data: "Unataka nikuandikie nini? Mfano: .gpt nifundishe kupika" });
            // Hapa unaweza kuunganisha API ya AI baadaye
            return res.json({ 
                action: 'reply', 
                data: `[🤖 ${user.level} AI]\n\nHabari ${user.name}, nimepokea swali lako: "${text}".\n\n_Hivi sasa mfumo wa AI unashughulikiwa na Admin._` 
            });

        case 'sticker':
        case 's':
            return res.json({ 
                action: 'reply', 
                data: "📸 Nitumie picha/video fupi kisha weka caption ya *.sticker*" 
            });

        case 'tiktok':
        case 'ig':
            if (user.level !== 'VIP') {
                return res.json({ action: 'reply', data: "🚫 Samahani, downloader ni kwa wateja wa VIP tu!" });
            }
            return res.json({ action: 'reply', data: "⏳ Napakua file lako, subiri kidogo..." });

        case 'id':
            return res.json({ 
                action: 'reply', 
                data: `📋 *TAARIFA ZA MTEJA*\n\n👤 Jina: ${user.name}\n🔑 ID: ${clientId}\n💎 Level: ${user.level}\n✅ Status: Active` 
            });

        default:
            // Kama command haipo Vercel, bot isijibu chochote
            return res.json({ action: 'none' });
    }
}
