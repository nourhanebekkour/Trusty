
import express from "express"
import adminRoutes from "./Routes/administrateurRoutes.js"
const app = express()
app.use(express.json());
app.use("/api/admin", adminRoutes)


app.listen(3000,() => {
  console.log("Server running on port 3000")
})