import express from "express";
import AuthRouter from "./routes/auth.router";
import DashboardRouter from "./routes/dashboard.router";
import ProfileRouter from "./routes/profile.router";
import cors from "cors";
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(AuthRouter);
app.use(DashboardRouter);
app.use(ProfileRouter);
app.listen(PORT, () => {
  console.log(`Server running in PORT: ${PORT}`);
});
