import express from "express";
import cors from "cors";



const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const PORT = 5000;


app.listen(5000);