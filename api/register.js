const mongoose = require('mongoose');

// Schema rahisi
const UserSchema = new mongoose.Schema({}, { strict: false });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: "Tumia POST mzee" });

    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const { clientId, data, adminKey } = req.body;

        // Ulinzi wa API yako
        if (adminKey !== "YAKO_SIRI_123") {
            return res.status(403).json({ status: false, message: "Wewe siyo Admin!" });
        }

        const UserRegistry = mongoose.models.UserRegistry || mongoose.model("UserRegistry", UserSchema, "UserRegistry");

        // Tunahifadhi mteja kulingana na ID yake (namba ya simu)
        await UserRegistry.findOneAndUpdate(
            { system_id: "USER_DATA" }, 
            { $set: { [clientId]: data } }, 
            { upsert: true }
        );

        return res.json({ status: true, message: "Mteja kawekwa tayari!" });

    } catch (err) {
        return res.status(500).json({ status: false, error: err.message });
    }
                                         }
             
