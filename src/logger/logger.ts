import * as fs from "fs";
import moment from "moment-timezone";
import colors from "colors/safe";

function removeANSI(logLine: string): string {
  // Remove ANSI Escape Codes
  return logLine.replace(/\x1B\[([0-?]*[ -/]*[@-~])/g, "");
}

function clearLogsFolder(folder: string) {
  fs.rmdirSync(folder, { recursive: true });
  fs.mkdirSync(folder, { recursive: true });
}

function consoleLog(level: string, type: string, module: string, text: string) {
  type = type.charAt(0).toUpperCase() + type.slice(1);
  const colorMap: { [key: string]: (text: string) => string } = {
    Info: colors.blue,
    Success: colors.green,
    Error: colors.red,
    Debug: colors.gray,
  };

  const formattedTimestamp = colors.white(
    getCurrentTimestamp("YYYY-MM-DD HH:mm:ss")
  );
  const formattedType = colorMap[type]
    ? colorMap[type](`[ ${type.toUpperCase()} : ATHENACMDS : `)
    : type.toUpperCase();
  const formattedModule = colorMap[type]
    ? colorMap[type](`${module} ]`)
    : module;
  const formattedText = colors.white(`ATHENA : ${text}`);

  if (level === "info" && type === "Debug") return;

  console.log(
    `${formattedTimestamp} ${formattedType} ${formattedModule} : ${formattedText}`
  );
}

async function fileLog(level: string, logFolder: string, logText: string) {
  const currentDate = getCurrentTimestamp("DD-MM-YYYY");
  const logFilename = `${logFolder}/${currentDate}.log`;
  logText = removeANSI(logText);
  logText = `\n${logText}`;

  try {
    if (!fs.existsSync(logFilename)) {
      // file is just going to be created
      fs.writeFileSync(
        logFilename,
        `    ┌─────────────────────────────────────────────────────────────────────────────┐
    │         Current Date: ${currentDate}                                            
    │         Program Start: ${getCurrentTimestamp(
      "HH:mm:ss"
    )}                                             
    │         Log Level: ${level}                                                    
    └─────────────────────────────────────────────────────────────────────────────┘\n`
      );
    }
    fs.appendFileSync(logFilename, logText);
  } catch (err) {
    console.error(`Error writing to log file: ${err}`);
  }
}

function getCurrentTimestamp(format: string, tz?: string): string {
  return moment()
    .tz(tz || "America/Chicago")
    .format(format);
}

function deleteToday(tz: string, logFolder: string) {
  const currentDate = getCurrentTimestamp("DD-MM-YYYY", tz);
  const logFilePath = `${logFolder}/${currentDate}.log`;

  if (fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
    console.log(`BetterLogger: ${currentDate}.log`);
  }
}

export {
  clearLogsFolder,
  consoleLog,
  fileLog,
  getCurrentTimestamp,
  deleteToday,
};
