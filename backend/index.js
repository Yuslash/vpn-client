const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

const MONGO_URI = "mongodb://localhost:27017/";
const DB_NAME = "wireguard_db";
const COLLECTION_NAME = "configurations";

// Manually set the player name
const MANUAL_PLAYER_NAME = "itisworking";

// Connect to MongoDB and fetch the config for the fixed player
async function getConfigForPlayer(playerName) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find the config for the specific player
    const config = await collection.findOne({ playerName });
    await client.close();
    
    return config;
}

// API Route to get WireGuard config for the manually set player
app.get("/get-wg-config", async (req, res) => {
    try {
        const config = await getConfigForPlayer(MANUAL_PLAYER_NAME);
        if (!config) return res.status(404).json({ error: "No config found for the player" });

        res.json({ playerName: config.playerName, wireguardConfig: config.wireguardConfig });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
