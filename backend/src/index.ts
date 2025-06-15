import express from "express";
import cors from "cors";
import { client, connectDB } from "./db";
import bcrypt from "bcrypt";
import { Request, Response, RequestHandler, NextFunction } from "express";
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

export interface User {
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

export interface Event {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: {
    placeId: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | string;
  isPublic: boolean;
  isDraft: boolean;
  tags: string[];
  participants: string[];
  reminders: number[];
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string; 
  creatorUsername?: string;
  creatorEmail?: string;
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
      { userId: insertedUser._id.toString(), email: newUser.email },
      'secret_token_do_not_share',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token
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
      { userId: existingUser._id.toString(), email: existingUser.email },
      'secret_token_do_not_share',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      userId: existingUser._id.toString(),  
      email: existingUser.email,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/events", authMiddleware, async (req: AuthRequest, res: Response) => {
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

  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
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
  const locationData = typeof location === 'string' 
    ? { placeId: '', address: location }
    : location;
  if (endDateTime <= startDateTime) {
    res.status(400).json({ message: "End time must be after start time" });
    return;
  }
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection<User>("users");

    const creator = await usersCollection.findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { username: 1, email: 1 } }
    );

    if (!creator) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description?.trim() || '',
      startDate,
      startTime,
      endDate,
      endTime,
      location: locationData,
      isPublic: Boolean(isPublic),
      isDraft: Boolean(isDraft),
      tags: Array.isArray(tags) ? tags : [],
      participants: Array.isArray(participants) ? participants : [],
      reminders: Array.isArray(reminders) ? reminders : [],
      isRecurring: Boolean(isRecurring),
      recurrencePattern: isRecurring ? recurrencePattern : null,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
      createdBy: req.userId,
      creatorUsername: creator.username,
      creatorEmail: creator.email
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

    const formattedEvents = events.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    res.status(200).json(formattedEvents);

  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET single event by ID (public access)
app.get("/api/events/:eventId", async (req, res, next) => {
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection<Event>("events");
    const usersCollection = db.collection<User>("users")

    if (!ObjectId.isValid(req.params.eventId)) {
      res.status(400).json({ message: "Invalid event ID format" });
      return;
    }

    const event = await eventsCollection.findOne({
      _id: new ObjectId(req.params.eventId),
      isDraft: false 
    });

    const creator = await usersCollection.findOne(
      { _id: new ObjectId(event?.createdBy) },
      { projection: { username: 1 } }
    );

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const responseEvent = {
      ...event,
      id: event._id.toString(),
      creatorUsername: creator?.username || 'Unknown',
      _id: undefined 
    };

    res.status(200).json(responseEvent);
    return;
  } catch (err) {
    console.error("Failed to fetch event:", err);
    next(err);
    return;
  }
});

app.get("/api/participating", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection<User>("users");

    const currentUser = await usersCollection.findOne(
      { _id: new ObjectId(authReq.userId) },
      { projection: { email: 1 } }
    );

    if (!currentUser?.email) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const events = await eventsCollection
      .find({ 
        participants: currentUser.email,
        isDraft: false 
      })
      .toArray();

    res.status(200).json(
      events.map(({ _id, ...rest }) => ({
        id: _id.toString(),
        ...rest,
      }))
    );
    return;
  } catch (err) {
    next(err);
    return;
  }
});

// get User by Id
app.get("/api/user/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection<User>("users");

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

app.patch("/api/user/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection<User>("users");

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { firstName, lastName, phoneNumber, photoBase64 } = req.body;
    const updateFields: Partial<User> = {};

    if (typeof firstName === "string" && firstName.trim()) updateFields.firstName = firstName.trim();
    if (typeof lastName === "string" && lastName.trim()) updateFields.lastName = lastName.trim();
    if (typeof phoneNumber === "string" && phoneNumber.trim()) updateFields.phoneNumber = phoneNumber.trim();
    if (typeof photoBase64 === "string" && photoBase64.trim()) updateFields.photoBase64 = photoBase64.trim();

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: "No valid fields to update." });
      return;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(String(userId)) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(String(userId)) },
      { projection: { password: 0 } }
    );

    res.status(200).json(updatedUser);
    return;
  } catch (err) {
    console.error("Failed to update user:", err);
    res.status(500).json({ message: "Failed to update user" });
    return;
  }
}),

app.get("/api/users/lookup", authMiddleware, (async (req, res, next) => {
  try {
      const authReq = req as AuthRequest;
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const client = await connectDB();
      const db = client.db("calendar");
      const usersCollection = db.collection<User>("users");

      const users = await usersCollection.find({
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } }
        ]
      }, {
        projection: {
          _id: 1,
          email: 1,
          username: 1,
          firstName: 1,
          lastName: 1
        }
      }).limit(10).toArray();

      return res.status(200).json(
        users.map(user => ({
          id: user._id?.toString(),
          email: user.email,
          username: user.username,
          name: `${user.firstName} ${user.lastName}`
        }))
      );
    } catch (err) {
      return next(err);
    }
  }) as RequestHandler
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
