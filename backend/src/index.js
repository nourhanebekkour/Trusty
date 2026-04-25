
import express from "express"
import professeurRoutes from "./Routes/professeurRoute.js"
const app = express()
app.use(express.json());
app.use("/api/professeur", professeurRoutes)


app.listen(3000,() => {
  console.log("Server running on port 3000")
})