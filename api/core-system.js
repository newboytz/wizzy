const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // 1. Hapa unaweza kuweka ulinzi wa Password/Token
    const { token } = req.query;
    if (token !== "MZEE_WA_PLUGS_2026") {
        return res.status(401).send("Unauthorized Access!");
    }

    // 2. Soma kodi yako ya Index (Core) ambayo ipo kwenye root folder
    const indexPath = path.join(process.cwd(), 'core', 'index.js');
    const indexCode = fs.readFileSync(indexPath, 'utf8');

    // 3. Tuma kodi kama Plain Text ili Loader iweze kuisoma
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(indexCode);
}
