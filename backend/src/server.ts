import express from "express";
import cors from "cors";


// imported routes
import authRoute from "./routes/auth.route.js";


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoute);


const PORT = 5000;


app.listen(5000);