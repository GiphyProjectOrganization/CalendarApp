import express from "express";
import cors from "cors";
import { client, connectDB } from "./db";
import bcrypt from "bcrypt";
import { Request, Response, RequestHandler, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectId, WithId, Document } from "mongodb";
import { authMiddleware, adminMiddleware, AuthRequest } from "./middleware/auth"

const app = express();
const PORT = 5000;

app.use(cors());
//changed to 2mb bc when encoded to Base64, the encoded version can exceed 1mb; the components accept up to 1mb still
app.use(express.json({ limit: '2mb' })); 

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
  isBlocked: boolean,
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

export interface Contact {
  userId: ObjectId; 
  owner: ObjectId;
  addedAt: Date;
  lists: ObjectId[];
}

export interface ContactList {
  _id?: ObjectId;
  owner: ObjectId;
  name: string;
  isDefault: boolean; //default lists (family, friends, work)
  createdAt: Date;
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
    res.status(400).json({ message: "Username must be between 3 and 30 characters!" });
    return;
  }
  if (!/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    res.status(400).json({ message: "Password must have one number and one symbol!" });
    return;
  }
  if (firstName.length < 1 || firstName.length >= 30 || !/^[A-Za-z]+$/.test(firstName)) {
    res.status(400).json({ message: "First name must be between 1 and 30 characters and include only letters!" });
    return;
  }
  if (lastName.length < 1 || lastName.length >= 30 || !/^[A-Za-z]+$/.test(lastName)) {
    res.status(400).json({ message: "Last name must be between 1 and 30 characters and include only letters!" });
    return;
  }
  if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
    res.status(400).json({ message: "Phone number must be 10 digits and include only numbers!" });
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
      isBlocked: false,
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      photoBase64
    };

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const insertResult = await usersCollection.insertOne(newUser, { session });
        const insertedUserId = insertResult.insertedId;

        if (!insertedUserId) {
          throw new Error("User registration failed");
        }

        const contactListsCollection = db.collection<ContactList>("contactLists");
        await contactListsCollection.insertMany([
          {
            owner: insertedUserId,
            name: "Family",
            isDefault: true,
            createdAt: new Date()
          },
          {
            owner: insertedUserId,
            name: "Friends",
            isDefault: true,
            createdAt: new Date()
          },
          {
            owner: insertedUserId,
            name: "Work",
            isDefault: true,
            createdAt: new Date()
          }
        ], { session });

        const token = jwt.sign(
          { userId: insertedUserId.toString(), email: newUser.email },
          'secret_token_do_not_share',
          { expiresIn: '1h' }
        );

        const insertedUser = await usersCollection.findOne(
          { _id: insertedUserId },
          { projection: { password: 0 }, session }
        );

        if (!insertedUser) {
          throw new Error("Failed to retrieve created user");
        }

        res.status(201).json({
          userId: insertedUser._id.toString(),
          email: insertedUser.email,
          profilePhoto: insertedUser.photoBase64,
          token,
          isAdmin: insertedUser.isAdmin,
          isBlocked: insertedUser.isBlocked
        });
      });
    } finally {
      await session.endSession();
    }
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
      profilePhoto: existingUser.photoBase64,
      token,
      isAdmin: existingUser.isAdmin,
      isBlocked: existingUser.isBlocked
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

app.patch("/api/events/:eventId", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const updates = req.body;

  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (updates.title) {
    if (!updates.title.trim()) {
      res.status(400).json({ message: "Title is required" });
      return;
    }
    if (updates.title.length < 3 || updates.title.length > 30) {
      res.status(400).json({ message: "Title must be between 3 and 30 characters" });
      return;
    }
  }

  if (updates.description && updates.description.length > 500) {
    res.status(400).json({ message: "Description must not exceed 500 characters" });
    return;
  }

  if (updates.startDate || updates.startTime || updates.endDate || updates.endTime) {
    const startDate = updates.startDate || req.body.originalStartDate;
    const startTime = updates.startTime || req.body.originalStartTime;
    const endDate = updates.endDate || req.body.originalEndDate;
    const endTime = updates.endTime || req.body.originalEndTime;

    if (!startDate || !startTime || !endDate || !endTime) {
      res.status(400).json({ message: "Start and end date/time are required" });
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      res.status(400).json({ message: "End time must be after start time" });
      return;
    }
  }

  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");

    const existingEvent = await eventsCollection.findOne({
      _id: new ObjectId(eventId),
      createdBy: req.userId
    });

    if (!existingEvent) {
      res.status(404).json({ message: "Event not found or you don't have permission to edit it" });
      return;
    }

    let locationUpdate = updates.location;
    if (updates.location) {
      locationUpdate = typeof updates.location === 'string'
        ? { placeId: '', address: updates.location }
        : updates.location;
    }

    const updateData = {
      ...updates,
      ...(updates.location && { location: locationUpdate }),
      updatedAt: new Date().toISOString()
    };

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      res.status(400).json({ message: "No changes detected" });
      return;
    }

    res.status(200).json({ message: "Event updated successfully!" });
  } catch (err) {
    console.error("Failed to update event:", err);
    res.status(500).json({ message: "Failed to update event. Please try again." });
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

      // Build $or array for searching by email, username, phoneNumber, or full name
      const searchRegex = new RegExp(query, 'i');
      const users = await usersCollection.aggregate([
        {
          $addFields: {
            fullName: { $concat: ["$firstName", " ", "$lastName"] }
          }
        },
        {
          $match: {
            $or: [
              { email: { $regex: searchRegex } },
              { username: { $regex: searchRegex } },
              { phoneNumber: { $regex: searchRegex } },
              { fullName: { $regex: searchRegex } }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            email: 1,
            username: 1,
            firstName: 1,
            lastName: 1,
            phoneNumber: 1,
            photoBase64: 1
          }
        },
        { $limit: 10 }
      ]).toArray();

      return res.status(200).json(
        users.map(user => ({
          id: user._id?.toString(),
          email: user.email,
          username: user.username,
          name: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.phoneNumber,
          profilePhoto: user.photoBase64
        }))
      );
    } catch (err) {
      return next(err);
    }
  }) as RequestHandler
);

// GET user by ID (public access)
app.get("/api/users/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID format" });
      return
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection<User>("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
        }
      }
    );

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return
    }

    res.status(200).json({
      id: user._id?.toString(),
      email: user.email,
      username: user.username,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.photoBase64
    });
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

app.get("/api/contact-lists", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactListsCollection = db.collection<ContactList>("contactLists");
    const userObjectId = new ObjectId(req.userId);

    const contactLists = await contactListsCollection.find({
      owner: userObjectId
    }).toArray();

    res.status(200).json(contactLists.map(list => ({
      id: list._id?.toString(),
      name: list.name,
      isDefault: list.isDefault,
      createdAt: list.createdAt
    })));
  } catch (err) {
    console.error("Failed to fetch contact lists:", err);
    res.status(500).json({ message: "Failed to fetch contact lists" });
  }
});

// Create a new contact list
app.post("/api/contact-lists", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "List name is required" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactListsCollection = db.collection<ContactList>("contactLists");
    const userObjectId = new ObjectId(req.userId);

    const existingList = await contactListsCollection.findOne({
      owner: userObjectId,
      name: name.trim()
    });

    if (existingList) {
      res.status(409).json({ message: "You already have a list with this name" });
      return;
    }

    const newList: ContactList = {
      owner: userObjectId,
      name: name.trim(),
      isDefault: false,
      createdAt: new Date()
    };

    const result = await contactListsCollection.insertOne(newList);

    res.status(201).json({
      id: result.insertedId.toString(),
      name: newList.name,
      isDefault: newList.isDefault,
      createdAt: newList.createdAt
    });
  } catch (err) {
    console.error("Failed to create contact list:", err);
    res.status(500).json({ message: "Failed to create contact list" });
  }
});

app.delete("/api/contact-lists/:listId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { listId } = req.params;
    if (!ObjectId.isValid(listId)) {
      res.status(400).json({ message: "Invalid list ID format" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactListsCollection = db.collection<ContactList>("contactLists");
    const contactsCollection = db.collection<Contact>("contacts");

    const list = await contactListsCollection.findOne({
      _id: new ObjectId(listId),
      owner: new ObjectId(req.userId)
    });

    if (!list) {
      res.status(404).json({ message: "List not found" });
      return;
    }

    if (list.isDefault) {
      res.status(400).json({ message: "Cannot delete default lists" });
      return;
    }

    await contactsCollection.updateMany(
      { lists: new ObjectId(listId) },
      { $pull: { lists: new ObjectId(listId) } }
    );

    await contactListsCollection.deleteOne({ _id: new ObjectId(listId) });

    res.status(200).json({ message: "Contact list deleted successfully" });
  } catch (err) {
    console.error("Failed to delete contact list:", err);
    res.status(500).json({ message: "Failed to delete contact list" });
  }
});

// Add a contact to the user's main list and optionally to specific lists
app.post("/api/contacts", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId: contactUserId, listIds } = req.body;
    
    if (!ObjectId.isValid(contactUserId)) {
      res.status(400).json({ message: "Invalid user ID format" });
      return;
    }

    if (req.userId === contactUserId) {
      res.status(400).json({ message: "Cannot add yourself as a contact" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection<User>("users");
    const contactsCollection = db.collection<Contact>("contacts");
    const contactListsCollection = db.collection<ContactList>("contactLists");
    const userObjectId = new ObjectId(req.userId);

    const contactUser = await usersCollection.findOne({
      _id: new ObjectId(contactUserId)
    });

    if (!contactUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // lists exist and belong to the user
    if (listIds && Array.isArray(listIds)) {
      for (const listId of listIds) {
        if (!ObjectId.isValid(listId)) {
          res.status(400).json({ message: "Invalid list ID format" });
          return;
        }

        const list = await contactListsCollection.findOne({
          _id: new ObjectId(listId),
          owner: userObjectId
        });

        if (!list) {
          res.status(404).json({ message: `List ${listId} not found` });
          return;
        }
      }
    }

    const existingContact = await contactsCollection.findOne({
      userId: new ObjectId(contactUserId),
      owner: userObjectId
    });

    if (existingContact) {
      if (listIds && Array.isArray(listIds)) {
        const updatedLists = [...new Set([
          ...existingContact.lists.map(id => id.toString()),
          ...listIds
        ])].map(id => new ObjectId(id));

        await contactsCollection.updateOne(
          { _id: existingContact._id },
          { $set: { lists: updatedLists } }
        );
      }

      res.status(200).json({ message: "Contact updated successfully" });
      return;
    }

    const newContact: Contact = {
      userId: new ObjectId(contactUserId),
      owner: userObjectId,
      addedAt: new Date(),
      lists: listIds && Array.isArray(listIds) 
        ? listIds.map(id => new ObjectId(id)) 
        : []
    };

    await contactsCollection.insertOne(newContact);

    res.status(201).json({ message: "Contact added successfully" });
  } catch (err) {
    console.error("Failed to add contact:", err);
    res.status(500).json({ message: "Failed to add contact" });
  }
});

app.get("/api/contacts", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactsCollection = db.collection<Contact>("contacts");
    const usersCollection = db.collection<User>("users");

    const contacts = await contactsCollection.find({
      owner: new ObjectId(req.userId)
    }).toArray();

    const contactDetails = await Promise.all(
      contacts.map(async contact => {
        const user = await usersCollection.findOne(
          { _id: contact.userId },
          {
            projection: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              phoneNumber: 1,
              photoBase64: 1
            }
          }
        );

        return {
          id: contact._id?.toString(),
          userId: user?._id.toString(),
          name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          email: user?.email,
          phoneNumber: user?.phoneNumber,
          photoBase64: user?.photoBase64,
          addedAt: contact.addedAt,
          lists: contact.lists.map(id => id.toString())
        };
      })
    );

    res.status(200).json(contactDetails);
  } catch (err) {
    console.error("Failed to fetch contacts:", err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

app.delete("/api/contacts/:contactId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { contactId } = req.params;
    const { listId } = req.query; 

    if (!ObjectId.isValid(contactId)) {
      res.status(400).json({ message: "Invalid contact ID format" });
      return;
    }

    if (listId && !ObjectId.isValid(listId as string)) {
      res.status(400).json({ message: "Invalid list ID format" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactsCollection = db.collection<Contact>("contacts");

    const contact = await contactsCollection.findOne({
      _id: new ObjectId(contactId),
      owner: new ObjectId(req.userId)
    });

    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    if (listId) {
      const result = await contactsCollection.updateOne(
        { _id: new ObjectId(contactId) },
        { $pull: { lists: new ObjectId(listId as string) } }
      );

      if (result.modifiedCount === 0) {
        res.status(404).json({ message: "Contact not in specified list" });
        return;
      }

      const updatedContact = await contactsCollection.findOne({
        _id: new ObjectId(contactId)
      });

      if (updatedContact && updatedContact.lists.length === 0) {
        await contactsCollection.deleteOne({ _id: new ObjectId(contactId) });
      }

      res.status(200).json({ message: "Contact removed from list" });
    } else {
      await contactsCollection.deleteOne({ _id: new ObjectId(contactId) });
      res.status(200).json({ message: "Contact removed successfully" });
    }
  } catch (err) {
    console.error("Failed to remove contact:", err);
    res.status(500).json({ message: "Failed to remove contact" });
  }
});

app.get("/api/contact-lists/:listId/contacts", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { listId } = req.params;
    if (!ObjectId.isValid(listId)) {
      res.status(400).json({ message: "Invalid list ID format" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactListsCollection = db.collection<ContactList>("contactLists");
    const contactsCollection = db.collection<Contact>("contacts");
    const usersCollection = db.collection<User>("users");

    // Verify list exists and belongs to user
    const list = await contactListsCollection.findOne({
      _id: new ObjectId(listId),
      owner: new ObjectId(req.userId)
    });

    if (!list) {
      res.status(404).json({ message: "List not found" });
      return;
    }

    // Find all contacts that include this list in their lists array
    const contacts = await contactsCollection.find({
      owner: new ObjectId(req.userId),
      lists: new ObjectId(listId)
    }).toArray();

    // Get user details for each contact
    const contactDetails = await Promise.all(
      contacts.map(async contact => {
        const user = await usersCollection.findOne(
          { _id: contact.userId },
          {
            projection: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              phoneNumber: 1,
              photoBase64: 1
            }
          }
        );

        return {
          id: contact._id?.toString(),
          userId: user?._id.toString(),
          name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          email: user?.email,
          phoneNumber: user?.phoneNumber,
          photoBase64: user?.photoBase64,
          addedAt: contact.addedAt,
          lists: contact.lists.map(id => id.toString()) 
        };
      })
    );

    res.status(200).json({
      list: {
        id: list._id?.toString(),
        name: list.name,
        isDefault: list.isDefault
      },
      contacts: contactDetails
    });
  } catch (err) {
    console.error("Failed to fetch contacts for list:", err);
    res.status(500).json({ message: "Failed to fetch contacts for list" });
  }
});

app.put("/api/contacts/:contactId/lists", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { contactId } = req.params;
    const { listIds } = req.body;

    if (!ObjectId.isValid(contactId)) {
      res.status(400).json({ message: "Invalid contact ID format" });
      return;
    }

    if (!Array.isArray(listIds)) {
      res.status(400).json({ message: "listIds must be an array" });
      return;
    }

    const client = await connectDB();
    const db = client.db("calendar");
    const contactsCollection = db.collection<Contact>("contacts");
    const contactListsCollection = db.collection<ContactList>("contactLists");
    const userObjectId = new ObjectId(req.userId);

    for (const listId of listIds) {
      if (!ObjectId.isValid(listId)) {
        res.status(400).json({ message: "Invalid list ID format" });
        return;
      }

      const list = await contactListsCollection.findOne({
        _id: new ObjectId(listId),
        owner: userObjectId
      });

      if (!list) {
        res.status(404).json({ message: `List ${listId} not found` });
        return;
      }
    }

    const result = await contactsCollection.updateOne(
      {
        _id: new ObjectId(contactId),
        owner: userObjectId
      },
      {
        $set: {
          lists: listIds.map(id => new ObjectId(id))
        }
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    res.status(200).json({ message: "Contact lists updated successfully" });
  } catch (err) {
    console.error("Failed to update contact lists:", err);
    res.status(500).json({ message: "Failed to update contact lists" });
  }
});

app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  const { query = '', page = 1, limit = 10 } = req.query;
  
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection("users");
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const searchFilter = query ? {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    } : {};
    
    const totalCount = await usersCollection.countDocuments(searchFilter);
    const users = await usersCollection
      .find(searchFilter, { projection: { password: 0 } }) // Don't return passwords
      .skip(skip)
      .limit(parseInt(limit as string))
      .toArray();
    
    const totalPages = Math.ceil(totalCount / parseInt(limit as string));
    const currentPage = parseInt(page as string);
    
    // Map MongoDB _id to id for frontend compatibility
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isBlocked: user.isBlocked || false,
      createdAt: user.createdAt || new Date().toISOString(),
      profilePhoto: user.photoBase64,
      address: user.address
    }));
    
    res.json({
      data: formattedUsers,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:userId/block', adminMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection("users");
    
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isBlocked: true, updatedAt: new Date().toISOString() } }
    );
    
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Failed to block user:', error);
    res.status(500).json({ message: 'Failed to block user' });
  }
});

app.put('/api/admin/users/:userId/unblock', adminMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection("users");
    
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isBlocked: false, updatedAt: new Date().toISOString() } }
    );
    
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Failed to unblock user:', error);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});

app.get('/api/admin/events', adminMiddleware, async (req, res) => {
  const { query = '', page = 1, limit = 10 } = req.query;
  
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const searchFilter = query ? {
      title: { $regex: query, $options: 'i' }
    } : {};
    
    const totalCount = await eventsCollection.countDocuments(searchFilter);
    const events = await eventsCollection
      .find(searchFilter)
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ createdAt: -1 })
      .toArray();
    
    const totalPages = Math.ceil(totalCount / parseInt(limit as string));
    const currentPage = parseInt(page as string);
    
    res.json({
      data: events,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

app.delete('/api/admin/events/:eventId', adminMiddleware, async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const eventsCollection = db.collection("events");
    
    const result = await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const client = await connectDB();
    const db = client.db("calendar");
    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const totalUsers = await usersCollection.countDocuments();
    const totalEvents = await eventsCollection.countDocuments();
    const draftEvents = await eventsCollection.countDocuments({ isDraft: true });
    const publicEvents = await eventsCollection.countDocuments({ isPublic: true });

    res.json({
      totalUsers,
      totalEvents,
      draftEvents,
      publicEvents
    });
  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    res.status(500).json({ message: 'Failed to fetch system stats' });
  }
});