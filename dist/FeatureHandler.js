import fs from "fs";
import Logger from "./logger";
import path from "path";
import getAllFiles from "./get-all-files";
class FeatureHandler {
    _features = new Map(); // <Feature name, Disabled GuildIDs>
    _client;
    _instance;
    constructor(client, instance, dir, typeScript = false) {
        this._client = client;
        this._instance = instance;
        this.setup(dir, typeScript);
    }
    setup = async (dir, typeScript) => {
        // Register built in features
        for (const [file, fileName] of getAllFiles(path.join(__dirname, "features"), typeScript ? ".ts" : "")) {
            this.registerFeature(require(file), fileName);
        }
        if (!dir) {
            return;
        }
        if (!fs.existsSync(dir)) {
            new Logger("debug", "America/Chicago", "logs").log("error", "FeatureHandler", `Listeners directory "${dir}" doesn't exist!`);
        }
        const files = getAllFiles(dir, typeScript ? ".ts" : "");
        const amount = files.length;
        if (amount > 0) {
            new Logger("debug", "America/Chicago", "logs").log("debug", "FeatureHandler", `Loading ${amount} listener${amount === 1 ? "" : "s"}...`);
            for (const [file, fileName] of files) {
                const debug = `AthenaCMDS DEBUG > Feature "${fileName}" load time`;
                if (this._instance.debug) {
                    console.time(debug);
                }
                this.registerFeature(require(file), fileName);
                if (this._instance.debug) {
                    console.timeEnd(debug);
                }
            }
        }
        else {
            new Logger("debug", "America/Chicago", "logs").log("success", "FeatureHandler", `Loaded ${amount} listener${amount === 1 ? "" : "s"}.`);
        }
    };
    registerFeature = (file, fileName) => {
        let func = file;
        const { config } = file;
        if (file.default) {
            func = file.default;
        }
        let testOnly = false;
        if (config) {
            const { displayName, dbName } = config;
            if (config.testOnly) {
                testOnly = true;
            }
            const missing = [];
            if (!displayName)
                missing.push("displayName");
            if (!dbName)
                missing.push("dbName");
            if (missing.length && this._instance.showWarns) {
                new Logger("debug", "America/Chicago", "logs").log("error", "FeatureHandler", `Feature "${fileName}" has a config file that doesn't contain the following properties: ${missing}`);
            }
        }
        else if (this._instance.showWarns) {
            new Logger("debug", "America/Chicago", "logs").log("error", "FeatureHandler", `Feature "${fileName}" does not export a config object.`);
        }
        if (typeof func !== "function") {
            return;
        }
        const isEnabled = (guildId) => {
            if (testOnly && !this._instance.testServers.includes(guildId)) {
                return false;
            }
            return this.isEnabled(guildId, file);
        };
        if (config && config.loadDBFirst === true) {
            new Logger("debug", "America/Chicago", "logs").log("error", "FeatureHandler", `config.loadDBFirst in features is no longer required. MongoDB is now connected to before any features or commands are loaded.`);
        }
        func(this._client, this._instance, isEnabled);
    };
    isEnabled = (guildId, feature) => {
        return !(this._features.get(feature) || []).includes(guildId);
    };
}
