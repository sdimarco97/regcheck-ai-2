import express from "express";
import routes from "./routes/routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/", routes);
app.use("/", (req, res) => res.json({ message: 'Message from server' }));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
