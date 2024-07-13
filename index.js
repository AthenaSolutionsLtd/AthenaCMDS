import AthenaCMDS from "./src";
import Logger from "./src/logger";

if (process.env.NODE_ENV === "development") {
  if (process.env.loggerException !== "delete")
    new Logger("debug", "America/Chicago", "logs").deleteToday();
}

export default AthenaCMDS;
