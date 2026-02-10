export default async function handler(req, res) {
    // 1. Ulinzi wa Method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Kupokea data kutoka Termux
    // userNumber inatoka kwa sender wa WhatsApp
    const { clientId, command, text, userNumber } = req.body;
    const amri = command ? command.toLowerCase() : '';

    // ---------------------------------------------------------
    // 1. DATABASE YA WATEJA (Ongeza wateja hapa)
    // ---------------------------------------------------------
    const wateja = {
        "001": { 
            name: "J_Wizzy_Tz", 
            active: true, 
            allowedCommands: ["id", "gpt", "sticker", "tiktok", "repo", "antilnk", "utani", "ping"] 
        },
        "002": { 
            name: "beka", 
            active: true, 
            allowedCommands: ["id", "gpt", "sticker", "ping"] 
        }
    };

    const user = wateja[clientId];

    // ---------------------------------------------------------
    // 2. ULINZI WA ID NA RUHUSA
    // ---------------------------------------------------------
    if (!user) {
        return res.json({ action: 'reply', data: "❌ ID yako (" + clientId + ") haijasajiliwa kwenye Cloud!" });
    }
    
    if (!user.active) {
        return res.json({ action: 'reply', data: "⚠️ Huduma yako imesitishwa. Wasiliana na Admin!" });
    }

    // Kagua kama command ipo kwenye ruhusa za mteja
    if (!user.allowedCommands.includes(amri)) {
        return res.json({ 
            action: 'reply', 
            data: `🚫 Samahani ${user.name}, huna ruhusa ya kutumia *.${amri}*. Upgrade kifurushi chako!` 
        });
    }

    // ---------------------------------------------------------
    // 3. SWITCH CASE (LOGIC ZA PLUGINS)
    // ---------------------------------------------------------
    switch (amri) {
        
        case 'ping':
            return res.json({ 
                action: 'reply', 
                data: `🚀 *CHUBWA-MD PING*\n\nLatency: 0.02ms\nServer: Vercel Cloud\nStatus: Online ✅` 
            });

        case 'id':
            return res.json({ 
                action: 'reply', 
                data: `📋 *TAARIFA ZA MTEJA*\n\n👤 Jina: ${user.name}\n🔑 ID: ${clientId}\n✅ Hali: Active\n📦 Plugins: ${user.allowedCommands.join(', ')}` 
            });

        case 'gpt':
        case 'ai':
            if (!text) return res.json({ action: 'reply', data: "Nieleze unachotaka nikusaidie. Mfano: .gpt mambo vipi?" });
            return res.json({ 
                action: 'reply', 
                data: `🤖 *J_WIZZY AI RESPONSE*\n\nHabari ${user.name}, ujumbe wako umefika Cloud. Mfumo wa Gemini unganishwa sasa hivi...` 
            });

        case 'utani':
            const madongo = [
                `Oya ${userNumber}, namba yako inaonekana kama vocha iliyokataliwa! 😂`,
                `Hivi ${userNumber}, hiyo profile picture ni yako au umeiba Google? 💀`,
                `Namba ${userNumber} mbona unachati kama unaandika barua ya madai? 🤣`
            ];
            const dongo = madongo[Math.floor(Math.random() * madongo.length)];
            return res.json({ action: 'reply', data: `🔥 *UTANI PRO*:\n\n${dongo}` });

        case 'antilnk':
            // Mteja akiandika .antilnk on au .antilnk off
            const status = text ? text.toLowerCase() : '';
            if (status === 'on' || status === 'off') {
                return res.json({ 
                    action: 'execute', 
                    status: status === 'on' ? 'active' : 'inactive',
                    data: `🛡️ *ANTILINK UPDATE*\nStatus: ${status.toUpperCase()}\nMfumo umerekebishwa kwenye Cloud.` 
                });
            }
            return res.json({ action: 'reply', data: "Tumia: *.antilnk on* au *.antilnk off*" });

        case 'repo':
            return res.json({ 
                action: 'reply', 
                data: "💻 *CHUBWA-MD HYBRID*\n\nSource Code: Hidden (Private License)\nDeveloper: J_Wizzy TZ" 
            });

        default:
            return res.json({ action: 'none' });
    }
            }
    
