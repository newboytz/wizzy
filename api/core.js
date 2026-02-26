const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    try {
        // Tunatafuta njia ya kuelekea kwenye folder la core
        const indexPath = path.join(process.cwd(), 'core', 'index.js');
        
        if (!fs.existsSync(indexPath)) {
            return res.status(404).send("Core System Not Found!");
        }

        const code = fs.readFileSync(indexPath, 'utf8');
        
        // Muhimu: Tuma kama text/plain ili loader iweze kuipakua
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(code);
    } catch (e) {
        res.status(500).send("Error: " + e.message);
    }
}
