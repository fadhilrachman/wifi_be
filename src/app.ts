import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

// Routers
import SuperadminCompanyRouter from "./routes/superadmin/company.router";
import SuperadminUserRouter from "./routes/superadmin/user.router";
import SuperadminAuthRouter from "./routes/superadmin/auth.router";
import OperatorProductRouter from "./routes/operator/product.router";
import OperatorUserRouter from "./routes/operator/user.router";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routers
app.use(SuperadminCompanyRouter);
app.use(SuperadminUserRouter);
app.use(SuperadminAuthRouter);
app.use(OperatorProductRouter);
app.use(OperatorUserRouter);

export default app;

