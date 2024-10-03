import * as fs from "fs";
import {
  clearLogsFolder,
  consoleLog,
  fileLog,
  getCurrentTimestamp,
  deleteToday,
} from "./logger.js";

class Logger {
  private level: string;
  private timezone: string;
  private logFolder: string;

  constructor(level: string, timezone: string, logFolder: string) {
    if (process.env.NODE_ENV === "development") {
      this.level = "debug";
    } else {
      this.level = level;
    }
    if (process.env.loggerFolder === undefined) {
      this.logFolder = logFolder;
    } else {
      this.logFolder = process.env.loggerFolder;
    }
    this.timezone = timezone;

    if (fs.existsSync(logFolder)) return;
    fs.mkdirSync(logFolder, { recursive: true });
  }

  log(type: string, module: string, text: string) {
    const timestamp = getCurrentTimestamp("DD-MM-YYYY HH:mm:ss", this.timezone);
    const logText = `[${timestamp}] [${type.toUpperCase()}][${module.toUpperCase()}] : ${text}`;

    consoleLog(this.level, type, module, text);
    fileLog(this.level, this.logFolder, logText);
  }

  clearLogs() {
    clearLogsFolder(this.logFolder);
  }

  deleteToday() {
    deleteToday(this.timezone, this.logFolder);
  }
}

export default Logger;
