import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import bcrypt from "bcrypt";

const app = express();
const PORT = 5000;
connectDB(); // connect to mongoDb

app.use(cors());
app.use(express.json());

app.get("/api/hello", async (_req, res) => {
  res.json({ message: "Hello from TypeScript Express backend!" });
});

app.listen(PORT, () => {
  console.log(`Backend is running at http://localhost:${PORT}`);
});

app.post("/api/register", async (req, res) => {
  const { username, firstName, lastName, password, phoneNumber, email } = req.body;


  if (
    !email?.trim() ||
    !password?.trim() ||
    !username?.trim() ||
    !lastName?.trim() ||
    !firstName?.trim() ||
    !phoneNumber?.trim()
  ) {
    return alert("Please enter valid credentials.");
  }

  try {

    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection("users");
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, firstName, lastName, phoneNumber, password: hashedPassword };
    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: "User registered successfully" });
    return
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return
  }
})


