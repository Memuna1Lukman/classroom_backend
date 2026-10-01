import express from "express";
import subjectRouter from './routes/subjects.js';
import cors from "cors"


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

app.use(express.json());

// Mounted route
app.use('/api/subjects', subjectRouter);

app.get('/', (req, res) => {
    res.send("Hello, welcome to the classroom API!");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});