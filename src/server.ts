import express from "express"
import router from "./routes"
import cors from "cors";
import helmet from "helmet";

const app = express()
const PORT = 8000

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", router)

app.listen(PORT, ()=>{
    console.log(`Running on Port ${PORT}`)
})