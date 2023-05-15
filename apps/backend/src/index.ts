import express, { Request, Response, NextFunction } from "express";
import mongoose, { Schema, Document } from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import cors from "cors";
import morgan from "morgan";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/password-manager");

interface UserInterface extends Document {
  email: string;
  password: string;
  twoFactorSecret: string;
  encryptedPasswords: {
    hostname: string;
    username: string;
    encryptedPassword: string;
  }[];
}

interface Req extends Request {
  userId: string;
}

// Define User model
const UserSchema: Schema = new Schema({
  email: String,
  password: String,
  twoFactorSecret: String,
  encryptedPasswords: [
    {
      hostname: String,
      username: String,
      encryptedPassword: String,
    },
  ],
});

const User = mongoose.model<UserInterface>("User", UserSchema);

// Set up Express and middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());

morgan.token("body", (req: any, res) => JSON.stringify(req.body));

app.use(morgan("[:date[clf]] :method :url :status :response-time ms - :body"));

// 2FA secret generation endpoing
app.post("/api/register/generate-2fa", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate user input
  // ...

  const twoFactorSecret = authenticator.generateSecret();
  const otpauthURL = authenticator.keyuri(
    email,
    "PasswordManager",
    twoFactorSecret
  );

  const qrCodeUrl = await qrcode.toDataURL(otpauthURL);

  res.json({
    message: "2FA secret generated successfully",
    twoFactorSecret,
    qrCodeUrl,
  });
});

// User registration API endpoint
app.post("/api/register", async (req: Request, res: Response) => {
  const { email, password, twoFactorToken, twoFactorSecret } = req.body;

  // Validate user input
  // ...

  // Verify 2FA token
  const isTokenValid = authenticator.check(twoFactorToken, twoFactorSecret);

  if (!isTokenValid) {
    return res.status(400).json({ message: "Invalid 2FA token" });
  }

  // Hash the password and save user to the database
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, twoFactorSecret });
  await user.save();

  // Create a JWT - login immediately
  const token = jwt.sign({ userId: user._id }, "secret-key", {
    expiresIn: "1h",
  });

  res.status(201).json({ token, message: "User registered successfully" });
});

// User authentication API endpoint
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password, twoFactorToken } = req.body;

  // Find user and compare the password
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Verify 2FA token
  const isTokenValid = authenticator.check(
    twoFactorToken,
    user.twoFactorSecret
  );
  if (!isTokenValid) {
    return res.status(401).json({ message: "Invalid 2FA token" });
  }

  // Create a JWT
  const token = jwt.sign({ userId: user._id }, "secret-key", {
    expiresIn: "1h",
  });

  res.json({ token, message: "Logged in successfully" });
});

// Middleware for checking JWT authentication
function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], "secret-key") as {
      userId: string;
    };
    (req as Req).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// CRUD operations for stored passwords
app.post(
  "/api/passwords",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { hostname, username, encryptedPassword } = req.body;
    await User.updateOne(
      { _id: (req as Req).userId },
      {
        $push: {
          encryptedPasswords: {
            hostname,
            username,
            encryptedPassword,
          },
        },
      }
    );
    res.status(201).json({ message: "Password added successfully" });
  }
);

app.get(
  "/api/passwords",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const user = await User.findById((req as Req).userId);
    if (!user) {
      res.status(404).json({ message: "User does not exits" });
      return;
    }

    res.json(user.encryptedPasswords);
  }
);

app.put(
  "/api/passwords/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hostname, username, encryptedPassword } = req.body;
    await User.updateOne(
      { _id: (req as Req).userId, "encryptedPasswords._id": id },
      {
        $set: {
          "encryptedPasswords.$.hostname": hostname,
          "encryptedPasswords.$.username": username,
          "encryptedPasswords.$.encryptedPassword": encryptedPassword,
        },
      }
    );
    res.json({ message: "Password updated successfully" });
  }
);

app.delete(
  "/api/passwords/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await User.updateOne(
      { _id: (req as Req).userId },
      {
        $pull: {
          encryptedPasswords: { _id: id },
        },
      }
    );
    res.json({ message: "Password deleted successfully" });
  }
);

app.post("/api/validate-token", async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    jwt.verify(token, "secret-key");
    res.json({ message: "Token is valid" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token has expired" });
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  }
});

app.post(
  "/api/passwords/hostname",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { hostname } = req.body;
    const user = await User.findById((req as Req).userId);
    if (!user) {
      res.status(404).json({ message: "User does not exist" });
      return;
    }

    const passwords = user.encryptedPasswords.filter(
      (password) => password.hostname === hostname
    );

    res.json(passwords);
  }
);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
