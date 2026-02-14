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
    const UserRegistry = mongoose.model(
      "UserRegistry",
      new mongoose.Schema({}, { strict: false }),
      "UserRegistry"
    );

    const AdminConfig = mongoose.model(
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

    // 3. Tuma kila kitu kwa pamoja
    return res.json({
      status: true,
      data: user[clientId], // Ruhusa za mteja (Plan, Plugins)
      adminApi: globalSettings ? globalSettings.base_api_keys : {}, // Hapa ndipo kuna OpenAI Key yako
    });

  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
        }
