import AgentAPI from "apminsight";
AgentAPI.config()
import express from "express";
import subjectRouter from './routes/subjects.js';
import cors from "cors"
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import usersRouter from './routes/users.js';
import { APIError } from "better-auth";
import classesRouter from './routes/classes.js'

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) {
  throw new Error('Frontend_url is not set in the .env file');
}

app.use(cors({
    origin:process.env.FRONTEND_URL,
    methods:['GET','POST','PUT','DELETE'],
    credentials:true
}))

app.all('api/auth/*splat',toNodeHandler(auth))

app.use(express.json());

app.use(securityMiddleware)

// Mounted route
app.use('/api/subjects', subjectRouter);
app.use("/api/users",usersRouter);
app.use("/api/classes",classesRouter);

app.get('/', (req, res) => {
    res.send("Hello, welcome to the classroom API!");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});