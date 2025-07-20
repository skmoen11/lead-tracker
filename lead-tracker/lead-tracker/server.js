require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

// MongoDB Connection
const uri = "mongodb+srv://leadUser:LeadSecure123@leadtracker.oeaph4z.mongodb.net/?retryWrites=true&w=majority&appName=leadTracker";
const client = new MongoClient(uri);

// Middleware
app.use(express.json());
app.use(express.static('public'));

async function run() {
  try {
    await client.connect();
    const db = client.db('leadTracker');
    const leads = db.collection('conversions');

    // Silent Webhook Endpoint
    app.post('/webhook', async (req, res) => {
      try {
        const leadData = {
          ...req.query,
          ...req.body,
          timestamp: new Date()
        };
        
        await leads.insertOne(leadData);
        res.status(200).end(); // No response to Telegram
      } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).end();
      }
    });

    // Data Retrieval Endpoint
    app.get('/getLeads', async (req, res) => {
      try {
        const data = await leads.find()
          .sort({ timestamp: -1 })
          .limit(100)
          .toArray();
        res.json(data);
      } catch (err) {
        console.error("DB Query Error:", err);
        res.status(500).json([]);
      }
    });

    // Start Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}
run();