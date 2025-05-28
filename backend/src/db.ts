
import { MongoClient, ServerApiVersion } from 'mongodb';
const password = encodeURIComponent("s3mC@dLb2v!r't5");
const uri = `mongodb+srv://mongoCal:${password}@calendarapp.vy0fu84.mongodb.net/?retryWrites=true&w=majority&appName=CalendarApp`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
        console.error("error on connect, disconnecting")
        console.log(e)
        // Ensures that the client will close when you finish/error
        await client.close();
    }

    return client

};

export { client, connectDB };