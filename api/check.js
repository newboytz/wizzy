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
      return res.status(400).json({ status: false, message: "No clientId" });
    }

    const UserRegistry = mongoose.model(
      "UserRegistry",
      new mongoose.Schema({}, { strict: false }),
      "UserRegistry"
    );

    const user = await UserRegistry.findOne({
      [clientId]: { $exists: true },
    });

    if (!user) {
      return res.json({ status: false, message: "Not registered" });
    }

    return res.json({
      status: true,
      data: user[clientId],
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
        }
