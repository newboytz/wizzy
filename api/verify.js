import mongoose from "mongoose";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
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

    const user = await UserRegistry.findOne({ [clientId]: { $exists: true } });
    const globalSettings = await AdminConfig.findOne({ system_id: "GLOBAL_CONTROL" });

    if (!user) {
      return res.status(403).json({ status: false, message: "Not registered in ULTRA system" });
    }

    return res.json({
      status: true,
      data: user[clientId], 
      adminApi: globalSettings ? globalSettings.base_api_keys : {}, 
      // Tunatuma mipangilio ya AI na Switch ya ON/OFF pekee
      aiSettings: globalSettings?.ai_settings || {},
      businessChat: globalSettings?.global_settings?.business_chat ?? true
    });

  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
  }
                                   
