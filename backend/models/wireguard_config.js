import mongoose from 'mongoose';

const wireguardConfigSchema = new mongoose.Schema({
    privateKey: { type: String, required: true },
    serverPublicKey: { type: String, required: true },
    address: { type: String, required: true },
    dns: { type: String, required: true },
    endpoint: { type: String, required: true },
    allowedIPs: { type: String, required: true },
    persistentKeepalive: { type: Number, required: true }
}, { _id: false });

const configurationSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    wireguardConfig: wireguardConfigSchema,
}, { timestamps: true });

const Configuration = mongoose.model('Configuration', configurationSchema);

export default Configuration;
