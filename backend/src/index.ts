import express from "express";
import cors from "cors";
import { client, connectDB } from "./db";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

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


// register
app.post("/api/register", async (req: Request, res: Response): Promise<void> => {
  const { username, firstName, lastName, password, phoneNumber, email } = req.body as {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber: string;
    email: string;
  };

  if (
    !email?.trim() ||
    !password?.trim() ||
    !username?.trim() ||
    !lastName?.trim() ||
    !firstName?.trim() ||
    !phoneNumber?.trim()
  ) {
    res.status(400).json({ message: "Please enter valid credentials." });
    return;
  }

  try {
    //connect to mongoDB 
    const client = await connectDB();
    const db = client.db("calendar"); // choose database 
    const usersCollection = db.collection("users"); // choose collection 

    //check if user is already exist 
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //make the obj with hash password 
    const newUser = { username, email, firstName, lastName, phoneNumber, password: hashedPassword };
    // insert object in database/collection
    await usersCollection.insertOne(newUser);

    //return alert this way because backend don't have alert keyword
    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});


