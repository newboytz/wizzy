import mongoose from "mongoose";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  // Inasoma MONGO_URI uliyoweka kwenye Vercel Dashboard
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  try {
    await connectDB();

    const { clientId } = req.query;
    if (!clientId) {
      return res.status(400).json({ status: false, message: "No clientId provided" });
    }

    // 1. Unganisha na Mikusanyiko (Collections) ya MongoDB
    // Kumbuka: mongoose.models inazuia kosa la 'OverwriteModelError'
    const UserRegistry = mongoose.models.UserRegistry || mongoose.model(
      "UserRegistry",
      new mongoose.Schema({}, { strict: false }),
      "UserRegistry"
    );

    const AdminConfig = mongoose.models.AdminConfig || mongoose.model(
      "AdminConfig",
      new mongoose.Schema({}, { strict: false }),
      "AdminConfig"
    );

    // 2. Tafuta Mteja na Mipangilio ya Siri ya Admin
    const user = await UserRegistry.findOne({ [clientId]: { $exists: true } });
    const globalSettings = await AdminConfig.findOne({ system_id: "GLOBAL_CONTROL" });

    if (!user) {
      return res.status(403).json({ status: false, message: "Not registered in ULTRA system" });
    }

    // 3. Tuma kila kitu kwa pamoja kulingana na muundo wako wa MongoDB
    return res.json({
      status: true,
      data: user[clientId], // Inatuma name, plan, na plugins
      adminApi: globalSettings ? globalSettings.base_api_keys : {}, // Inatuma tiktok, openai, n.k.
      // Hapa tunavuta data kutoka kwa 'global_settings' object kama ilivyo kwenye picha yako
      channelId: globalSettings?.global_settings?.force_follow_channel || null,
      maintenance: globalSettings?.global_settings?.maintenance || false
    });

  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
