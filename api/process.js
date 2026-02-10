export default async function handler(req, res) {
    // Ruhusu tu maombi ya POST kutoka kwa bot yako
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { clientId, command, text } = req.body;
    const amri = command ? command.toLowerCase() : '';

    // ---------------------------------------------------------
    // 1. DATABASE YA WATEJA (Hapa ndipo unaposajili watu)
    // ---------------------------------------------------------
    const wateja = {
        "001": { 
            name: "J_Wizzy_Tz", 
            active: true, 
            allowedCommands: ["id", "gpt", "sticker", "tiktok", "repo", "antilnk"] 
        },
        "002": { 
            name: "beka", 
            active: true, 
            allowedCommands: ["id", "gpt", "sticker"] 
        }
        // Ukipata mteja mpya, ongeza hapa chini...
    };

    const user = wateja[clientId];

    // ---------------------------------------------------------
    // 2. ULINZI NA KAGUZI
    // ---------------------------------------------------------
    if (!user) return res.json({ action: 'reply', data: "❌ ID yako haijasajiliwa!" });
    if (!user.active) return res.json({ action: 'reply', data: "⚠️ Huduma yako imesitishwa. Lipia upya!" });

    // Kagua kama anaruhusiwa kutumia plugin hii
    if (!user.allowedCommands.includes(amri)) {
        return res.json({ 
            action: 'reply', 
            data: `🚫 Samahani ${user.name}, huna ruhusa ya kutumia *.${amri}*. Upgrade kifurushi chako!` 
        });
    }

    // ---------------------------------------------------------
    // 3. SWITCH CASE (Hizi ndizo "Plugins" zako za Cloud)
    // ---------------------------------------------------------
    switch (amri) {
        
        case 'id':
            return res.json({ 
                action: 'reply', 
                data: `📋 *TAARIFA ZA MTEJA*\n\n👤 Jina: ${user.name}\n🔑 ID: ${clientId}\n✅ Hali: Active\n📦 Plugins unazoruhusiwa: ${user.allowedCommands.join(', ')}` 
            });

        case 'gpt':
        case 'ai':
            if (!text) return res.json({ action: 'reply', data: "Nieleze unachotaka nikusaidie. Mfano: .gpt mambo vipi?" });
            // Hapa unaweza kuweka API yako ya Gemini baadaye
            return res.json({ 
                action: 'reply', 
                data: `🤖 *J_Wizzy AI*\n\nHabari ${user.name}, nimepokea swali lako: "${text}". Mfumo wa AI unashughulikiwa na Admin sasa hivi.` 
            });

        case 'sticker':
        case 's':
            return res.json({ 
                action: 'reply', 
                data: "📸 Nitumie picha au video fupi kisha weka caption ya *.sticker*" 
            });

        case 'tiktok':
            if (!text || !text.includes('tiktok.com')) {
                return res.json({ action: 'reply', data: "Weka link ya TikTok! Mfano: .tiktok https://vm.tiktok.com/..." });
            }
            return res.json({ action: 'reply', data: "⏳ Napakua video ya TikTok, tafadhali subiri kidogo..." });

        case 'repo':
            return res.json({ 
                action: 'reply', 
                data: "💻 *BOT SOURCE CODE*\n\nBot hii inatumia mfumo wa J_Wizzy Hybrid Engine (Vercel + Termux)." 
            });

        default:
            // Kama command haipo kule Vercel, bot isifanye kitu (italeta commands za local)
            return res.json({ action: 'none' });
    }
        }
    
