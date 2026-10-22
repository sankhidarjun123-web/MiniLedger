import express from "express";
import cors from "cors";
import type { Request, Response } from "express";

// imported routes
import authRoute from "./routes/auth.route.js";


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
    res.end("Request recieved");
})
app.use("/auth", authRoute);


const PORT = 5000;


app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});