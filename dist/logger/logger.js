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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteToday = exports.getCurrentTimestamp = exports.fileLog = exports.consoleLog = exports.clearLogsFolder = void 0;
const fs = __importStar(require("fs"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const safe_1 = __importDefault(require("colors/safe"));
function removeANSI(logLine) {
    // Remove ANSI Escape Codes
    return logLine.replace(/\x1B\[([0-?]*[ -/]*[@-~])/g, "");
}
function clearLogsFolder(folder) {
    fs.rmdirSync(folder, { recursive: true });
    fs.mkdirSync(folder, { recursive: true });
}
exports.clearLogsFolder = clearLogsFolder;
function consoleLog(level, type, module, text) {
    type = type.charAt(0).toUpperCase() + type.slice(1);
    const colorMap = {
        Info: safe_1.default.blue,
        Success: safe_1.default.green,
        Error: safe_1.default.red,
        Debug: safe_1.default.gray,
    };
    const formattedTimestamp = safe_1.default.white(getCurrentTimestamp("YYYY-MM-DD HH:mm:ss"));
    const formattedType = colorMap[type]
        ? colorMap[type](`[ ${type.toUpperCase()} :  ATHENACMDS : `)
        : type.toUpperCase();
    const formattedModule = colorMap[type]
        ? colorMap[type](`${module} ]`)
        : module;
    const formattedText = safe_1.default.white(`${text}`);
    if (level === "info" && type === "Debug")
        return;
    console.log(`${formattedTimestamp} ${formattedType}${formattedModule} : ${formattedText}`);
}
exports.consoleLog = consoleLog;
async function fileLog(level, logFolder, logText) {
    const currentDate = getCurrentTimestamp("DD-MM-YYYY");
    const logFilename = `${logFolder}/${currentDate}.log`;
    logText = removeANSI(logText);
    logText = `\n${logText}`;
    try {
        if (!fs.existsSync(logFilename)) {
            // file is just going to be created
            fs.writeFileSync(logFilename, `    ┌─────────────────────────────────────────────────────────────────────────────┐
    │         Current Date: ${currentDate}                                            
    │         Program Start: ${getCurrentTimestamp("HH:mm:ss")}                                             
    │         Log Level: ${level}                                                    
    └─────────────────────────────────────────────────────────────────────────────┘\n`);
        }
        fs.appendFileSync(logFilename, logText);
    }
    catch (err) {
        console.error(`Error writing to log file: ${err}`);
    }
}
exports.fileLog = fileLog;
function getCurrentTimestamp(format, tz) {
    return (0, moment_timezone_1.default)()
        .tz(tz || "America/Chicago")
        .format(format);
}
exports.getCurrentTimestamp = getCurrentTimestamp;
function deleteToday(tz, logFolder) {
    const currentDate = getCurrentTimestamp("DD-MM-YYYY", tz);
    const logFilePath = `${logFolder}/${currentDate}.log`;
    if (fs.existsSync(logFilePath)) {
        fs.unlinkSync(logFilePath);
        console.log(`BetterLogger: ${currentDate}.log`);
    }
}
exports.deleteToday = deleteToday;
