
import express from "express"
import professeurRoutes from "./Routes/professeurRoute.js"
const app = express()
app.use(express.json());
app.use("/api/professeur", professeurRoutes)
import adminRoutes from "./Routes/administrateurRoutes.js"
app.use("/api/admin", adminRoutes)


app.listen(3000,() => {
  console.log("Server running on port 3000")
})