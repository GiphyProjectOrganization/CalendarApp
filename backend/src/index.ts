import express from "express";
import cors from "cors";
import { client, connectDB } from "./db";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId, WithId, Document } from "mongodb";
import { authMiddleware, AuthRequest } from "./middleware/auth"

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get("/api/hello", async (_req, res) => {
  res.json({ message: "Hello from TypeScript Express backend!" });
});

app.listen(PORT, () => {
  console.log(`Backend is running at http://localhost:${PORT}`);
});


// register
interface RegisterRequestBody {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  email: string;
  photoBase64?: string;
}

interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  photoBase64?: string;
}

app.post("/api/register", async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
  const { username, firstName, lastName, password, phoneNumber, email, photoBase64 } = req.body;

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

  if (username.length < 3 || username.length >= 30) {
    res.status(400).json({ message: "Username must be between 3 and 30 character!" });
    return;
  }
  if (!/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    res.status(400).json({ message: "Password must have one number and one symbol!" });
    return;
  }
  if (firstName.length < 1 || firstName.length >= 30 || !/^[A-Za-z]+$/.test(firstName)) {
    res.status(400).json({ message: "First name must be between 1 and 30 character and include only uppercase and lowercase letters!" });
    return;
  }
  if (lastName.length < 1 || lastName.length >= 30 || !/^[A-Za-z]+$/.test(lastName)) {
    res.status(400).json({ message: "last name must be between 1 and 30 character and include only uppercase and lowercase letters!" });
    return;
  }
  if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
    res.status(400).json({ message: "Phone Number must be 10 digits and include only numbers!" });
    return;
  }

  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection<User>("users");

    const existingUserEmail = await usersCollection.findOne({ email });
    if (existingUserEmail) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
    const existingUserUsername = await usersCollection.findOne({ username });
    if (existingUserUsername) {
      res.status(409).json({ message: "Username already in use" });
      return;
    }
    const existingUserPhone = await usersCollection.findOne({ phoneNumber });
    if (existingUserPhone) {
      res.status(409).json({ message: "Phone number already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      username,
      email,
      isAdmin: false,
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      photoBase64
    };

    await usersCollection.insertOne(newUser);

    const insertedUser = await usersCollection.findOne({ email });

    if (!insertedUser) {
      res.status(500).json({ message: "User registration failed." });
      return;
    }

    const token = jwt.sign(
      { userId: insertedUser._id, email: newUser.email },
      'secret_token_do_not_share',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      userId: insertedUser._id,
      user: {
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        photoBase64: newUser.photoBase64
      }
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});

// login
app.post("/api/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ message: "Please enter valid credentials." });
    return;
  }

  if (!/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    res.status(400).json({ message: "Password must have one number and one symbol!" });
    return
  }

  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (!existingUser) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Password is incorrect" });
      return;
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      'secret_token_do_not_share',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      userId: existingUser._id,
      user: {
        username: existingUser.username,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phoneNumber: existingUser.phoneNumber
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/events", async (req, res) => {
  const {
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
    isPublic,
    isDraft,
    tags,
    participants,
    reminders,
    isRecurring,
    recurrencePattern,
    createdAt,
    updatedAt
  } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  if (title.length < 3 || title.length > 30) {
    res.status(400).json({ message: "Title must be between 3 and 30 characters" });
    return;
  }

  if (!startDate || !startTime || !endDate || !endTime) {
    res.status(400).json({ message: "Start and end date/time are required" });
    return;
  }

  if (description && description.length > 500) {
    res.status(400).json({ message: "Description must not exceed 500 characters" });
    return;
  }

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);

  if (endDateTime <= startDateTime) {
    res.status(400).json({ message: "End time must be after start time" });
    return;
  }

  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");

    const eventData = {
      title: title.trim(),
      description: description?.trim() || '',
      startDate,
      startTime,
      endDate,
      endTime,
      location: location?.trim() || '',
      isPublic: Boolean(isPublic),
      isDraft: Boolean(isDraft),
      tags: Array.isArray(tags) ? tags : [],
      participants: Array.isArray(participants) ? participants : [],
      reminders: Array.isArray(reminders) ? reminders : [],
      isRecurring: Boolean(isRecurring),
      recurrencePattern: isRecurring ? recurrencePattern : null,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
      // TODO: Add createdBy field when authentication is implemented
      // createdBy: req.user.id
    };

    const result = await eventsCollection.insertOne(eventData);

    res.status(201).json({
      message: isDraft ? "Event saved as draft!" : "Event created successfully!",
      eventId: result.insertedId
    });

  } catch (err) {
    console.error("Failed to create event:", err);
    res.status(500).json({ message: "Failed to create event. Please try again." });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");

    const events = await eventsCollection.find({ isDraft: false }).toArray();

    res.status(200).json(events);

  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

//
app.get("/api/user/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection<User>("users");

    // req.userId is set by the auth middleware
    const user = await usersCollection.findOne(
      { _id: new ObjectId(String(req.userId)) },
      { projection: { password: 0 } }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
