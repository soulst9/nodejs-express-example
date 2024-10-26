const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const successHandler = require("./middleware/success_handler");
const errorHandler = require("./libraries/error");

const { authentication } = require("./middleware/auth");
const notification = require("./middleware/notification");

// v1 routers
const ContractRouter = require("./components/v1/contracts");
const EnterpriseRouter = require("./components/v1/enterprises");
const invites = require("./components/v1/invites");
const UserRouter = require("./components/v1/users");
const PaystubRouter = require("./components/v1/paystubs");
const ManagementRouter = require("./components/v1/managements");
const RollingRouter = require("./components/v1/rollings");
const OpenAPIRouter = require("./components/v1/openapis");
const CategoryRouter = require("./components/v1/categories");
const SurveyRouter = require("./components/v1/survey");
const NotificationRouter = require("./components/v1/notifications");

// v2 routers
const EnterpriseRouterV2 = require("./components/v2/enterprises");
const UserRouterV2 = require("./components/v2/users");
const SettingRouterV2 = require("./components/v2/settings");
const ContractRouterV2 = require("./components/v2/contracts");

// v3 routers
const EnterpriseRouterV3 = require("./components/v3/enterprises");
const UserRouterV3 = require("./components/v3/users");
const NotificationRouterV3 = require("./components/v3/notifications");

const rTracer = require("cls-rtracer");
const path = require("path");
const { setupCasbin, middlewareCasbin } = require("./libraries/casbin");

// casbin setup
// setupCasbin();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("tiny"));
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.static("/"));
app.set("rootDirectory", __dirname);

// add trasaction id in request object
app.use(rTracer.expressMiddleware());

// send system information about alarms to telegram
app.use(notification);

// authentication
app.use(authentication);

// authorization with casbin
// app.use(middlewareCasbin);

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// v1 routers
app.use("/entpr", EnterpriseRouter);
app.use("/invites", invites);
app.use("/users", UserRouter);
app.use("/contracts", ContractRouter);
app.use("/paystubs", PaystubRouter);
app.use("/managements", ManagementRouter);
app.use("/rollings", RollingRouter);
app.use("/openapis", OpenAPIRouter);
app.use("/categories", CategoryRouter);
app.use("/survey", SurveyRouter);
app.use("/notifications", NotificationRouter);

// v2 routers
app.use("/v2/enterprises", EnterpriseRouterV2);
app.use("/v2/users", UserRouterV2);
app.use("/v2/settings", SettingRouterV2);
app.use("/v2/contracts", ContractRouterV2);

// v3 routers
app.use("/v3/enterprises", EnterpriseRouterV3);
app.use("/v3/users", UserRouterV3);
app.use("/v3/notifications", NotificationRouterV3);

app.use(successHandler);

// swagger api documentation
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(specs, { explorer: true })
// );

// error handling
app.use(errorHandler);

// unhandled and uncaught error
process.on("unhandledRejection", (reason) => {
  console.log("unhandledRejection", new Date().toISOString(), reason);
  throw reason;
});
process.on("uncaughtException", (error) => {
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed
  console.log("uncaughtException", new Date().toISOString(), error);
  // process.exit(1);
});

module.exports = app;
