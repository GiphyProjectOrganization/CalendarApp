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
