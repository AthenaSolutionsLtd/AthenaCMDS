"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const logger_1 = require("./logger");
class Logger {
    level;
    timezone;
    logFolder;
    constructor(level, timezone, logFolder) {
        if (process.env.NODE_ENV === "development") {
            this.level = "debug";
        }
        else {
            this.level = level;
        }
        if (process.env.loggerFolder === undefined) {
            this.logFolder = logFolder;
        }
        else {
            this.logFolder = process.env.loggerFolder;
        }
        this.timezone = timezone;
        if (fs.existsSync(logFolder))
            return;
        fs.mkdirSync(logFolder, { recursive: true });
    }
    log(type, module, text) {
        const timestamp = (0, logger_1.getCurrentTimestamp)("DD-MM-YYYY HH:mm:ss", this.timezone);
        const logText = `[${timestamp}] [${type.toUpperCase()}] [${module.toUpperCase()}] : ${text}`;
        (0, logger_1.consoleLog)(this.level, type, module, text);
        (0, logger_1.fileLog)(this.level, this.logFolder, logText);
    }
    clearLogs() {
        (0, logger_1.clearLogsFolder)(this.logFolder);
    }
    deleteToday() {
        (0, logger_1.deleteToday)(this.timezone, this.logFolder);
    }
}
exports.default = Logger;
