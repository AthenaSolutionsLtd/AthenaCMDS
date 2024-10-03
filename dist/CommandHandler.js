var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import Logger from "./logger/index.js";
import path from "path";
import Command from "./Command.js";
import getAllFiles from "./get-all-files.js";
import disabledCommands from "./models/disabled-commands.js";
import requiredRoles from "./models/required-roles.js";
import cooldown from "./models/cooldown.js";
import channelCommands from "./models/channel-commands.js";
import { permissionList } from "./permissions.js";
import CommandErrors from "./enums/CommandErrors.js";
import Events from "./enums/Events.js";
const replyFromCheck = (reply, message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!reply) {
        return new Promise((resolve) => {
            resolve("No reply provided.");
        });
    }
    if (typeof reply === "string") {
        return message.reply({
            content: reply,
        });
    }
    else {
        let embeds = [];
        if (Array.isArray(reply)) {
            embeds = reply;
        }
        else {
            embeds.push(reply);
        }
        return message.reply({
            embeds,
        });
    }
});
export default class CommandHandler {
    constructor(instance, client, dir, disabledDefaultCommands, typeScript = false) {
        this._commands = new Map();
        this._client = null;
        this._commandChecks = new Map();
        this._client = client;
        this.setUp(instance, client, dir, disabledDefaultCommands, typeScript);
    }
    setUp(instance, client, dir, disabledDefaultCommands, typeScript = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Do not pass in TS here because this should always compiled to JS
            for (const [file, fileName] of getAllFiles(path.join(__dirname, "commands"))) {
                if (disabledDefaultCommands.includes(fileName)) {
                    continue;
                }
                yield this.registerCommand(instance, client, file, fileName, true);
            }
            // Do not pass in TS here because this should always compiled to JS
            for (const [file, fileName] of getAllFiles(path.join(__dirname, "command-checks"))) {
                this._commandChecks.set(fileName, require(file));
            }
            if (dir) {
                if (!fs.existsSync(dir)) {
                    new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Commands directory "${dir}" doesn't exist!`);
                }
                const files = getAllFiles(dir, typeScript ? ".ts" : "");
                const amount = files.length;
                new Logger("debug", "America/Chicago", "logs").log("success", "CommandHandler", `Loaded ${amount} command${amount === 1 ? "" : "s"}.`);
                for (const [file, fileName] of files) {
                    yield this.registerCommand(instance, client, file, fileName);
                }
                if (instance.isDBConnected()) {
                    yield this.fetchDisabledCommands();
                    yield this.fetchRequiredRoles();
                    yield this.fetchChannelOnly();
                }
                this._commands.forEach((command) => __awaiter(this, void 0, void 0, function* () {
                    command.verifyDatabaseCooldowns();
                    if (instance.isDBConnected()) {
                        const results = yield cooldown.find({
                            name: command.names[0],
                            type: command.globalCooldown ? "global" : "per-user",
                        });
                        for (const { _id, cooldown } of results) {
                            const [name, guildId, userId] = _id.split("-");
                            command.setCooldown(guildId, userId, cooldown);
                        }
                    }
                }));
                client.on("messageCreate", (message) => __awaiter(this, void 0, void 0, function* () {
                    const guild = message.guild;
                    let content = message.content;
                    const prefix = instance.getPrefix(guild).toLowerCase();
                    if (!content.toLowerCase().startsWith(prefix)) {
                        return;
                    }
                    if (instance.ignoreBots && message.author.bot) {
                        return;
                    }
                    // Remove the prefix
                    content = content.substring(prefix.length);
                    const args = content.split(/[ ]+/g);
                    // Remove the "command", leaving just the arguments
                    const firstElement = args.shift();
                    if (!firstElement) {
                        return;
                    }
                    // Ensure the user input is lower case because it is stored as lower case in the map
                    const name = firstElement.toLowerCase();
                    const command = this._commands.get(name);
                    if (!command) {
                        return;
                    }
                    const { error, slash } = command;
                    if (slash === true) {
                        return;
                    }
                    const { member, author: user, channel } = message;
                    for (const [checkName, checkFunction,] of this._commandChecks.entries()) {
                        if (!(yield checkFunction(guild, command, instance, member, user, (reply) => {
                            return replyFromCheck(reply, message);
                        }, args, name, channel))) {
                            return;
                        }
                    }
                    try {
                        command.execute(message, args);
                    }
                    catch (e) {
                        if (error) {
                            error({
                                error: CommandErrors.EXCEPTION,
                                command,
                                message,
                                info: {
                                    error: e,
                                },
                            });
                        }
                        else {
                            message.reply(instance.messageHandler.get(guild, "EXCEPTION"));
                            new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", e);
                        }
                        instance.emit(Events.COMMAND_EXCEPTION, command, message, e);
                    }
                }));
            }
            const decrementCountdown = () => {
                this._commands.forEach((command) => {
                    command.decrementCooldowns();
                });
                setTimeout(decrementCountdown, 1000);
            };
            decrementCountdown();
        });
    }
    registerCommand(instance, client, file, fileName, builtIn = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let configuration = yield require(file);
            // person is using 'export default' so we import the default instead
            if (configuration.default && Object.keys(configuration).length === 1) {
                configuration = configuration.default;
            }
            const { name = fileName, category, commands, aliases, init, callback, run, execute, error, description, requiredPermissions, permissions, slash, expectedArgs, expectedArgsTypes, minArgs, options = [], } = configuration;
            const { testOnly } = configuration;
            if (run || execute) {
                new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command located at "${file}" has either a "run" or "execute" function. Please rename that function to "callback".`);
            }
            let names = commands || aliases || [];
            if (!name && (!names || names.length === 0)) {
                new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command located at "${file}" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.`);
            }
            if (typeof names === "string") {
                names = [names];
            }
            if (typeof name !== "string") {
                new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command located at "${file}" does not have a string as a name.`);
            }
            if (name && !names.includes(name.toLowerCase())) {
                names.unshift(name.toLowerCase());
            }
            if (requiredPermissions || permissions) {
                for (const perm of requiredPermissions || permissions) {
                    if (!permissionList.includes(perm)) {
                        new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command located at "${file}" has an invalid permission node: "${perm}". Permissions must be all upper case and be one of the following: "${[
                            ...permissionList,
                        ].join('", "')}"`);
                    }
                }
            }
            const missing = [];
            if (!category) {
                missing.push("Category");
            }
            if (!description) {
                missing.push("Description");
            }
            if (missing.length && instance.showWarns) {
                new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command "${names[0]}" does not have the following properties: ${missing}.`);
            }
            if (testOnly && !instance.testServers.length) {
                new Logger("debug", "America/Chicago", "logs").log("debug", "CommandHandler", `Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`);
            }
            if (slash !== undefined && typeof slash !== "boolean" && slash !== "both") {
                new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`);
            }
            if (!slash && options.length) {
                new Logger("debug", "America/Chicago", "logs").log("info", "CommandHandler", `Command "${names[0]}" has an "options" property but is not a slash command.`);
            }
            if (slash && !(builtIn && !instance.isDBConnected())) {
                if (!description) {
                    new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `A description is required for command "${names[0]}" because it is a slash command.`);
                }
                if (minArgs !== undefined && !expectedArgs) {
                    new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `Command "${names[0]}" has "minArgs" property defined without "expectedArgs" property as a slash command.`);
                }
                if (options.length) {
                    for (const key in options) {
                        const name = options[key].name;
                        let lowerCase = name.toLowerCase();
                        if (name !== lowerCase && instance.showWarns) {
                            new Logger("debug", "America/Chicago", "logs").log("info", "CommandHandler", `Command "${names[0]}" has an option of "${name}". All option names must be lower case for slash commands. AthenaCMDS will modify this for you.`);
                        }
                        if (lowerCase.match(/\s/g)) {
                            lowerCase = lowerCase.replace(/\s/g, "_");
                            new Logger("debug", "America/Chicago", "logs").log("info", "CommandHandler", `Command "${names[0]}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. AthenaCMDS will modify this for you.`);
                        }
                        options[key].name = lowerCase;
                    }
                }
                else if (expectedArgs) {
                    const split = expectedArgs
                        .substring(1, expectedArgs.length - 1)
                        .split(/[>\]] [<\[]/);
                    for (let a = 0; a < split.length; ++a) {
                        const item = split[a];
                        options.push({
                            name: item.replace(/ /g, "-").toLowerCase(),
                            description: item,
                            type: expectedArgsTypes && expectedArgsTypes.length >= a
                                ? expectedArgsTypes[a]
                                : 3,
                            required: a < minArgs,
                        });
                    }
                }
                const slashCommands = instance.slashCommands;
                if (testOnly) {
                    for (const id of instance.testServers) {
                        yield slashCommands.create(names[0], description, options, id);
                    }
                }
                else {
                    yield slashCommands.create(names[0], description, options);
                }
            }
            if (callback) {
                if (init) {
                    init(client, instance);
                }
                const command = new Command(instance, client, names, callback, error, configuration);
                for (const name of names) {
                    // Ensure the alias is lower case because we read as lower case later on
                    this._commands.set(name.toLowerCase(), command);
                }
            }
        });
    }
    get commands() {
        const results = [];
        const added = [];
        this._commands.forEach(({ names, category = "", description = "", expectedArgs = "", hidden = false, testOnly = false, }) => {
            if (!added.includes(names[0])) {
                results.push({
                    names: [...names],
                    category,
                    description,
                    syntax: expectedArgs,
                    hidden,
                    testOnly,
                });
                added.push(names[0]);
            }
        });
        return results;
    }
    getCommandsByCategory(category, visibleOnly) {
        const results = [];
        for (const command of this.commands) {
            if (visibleOnly && command.hidden) {
                continue;
            }
            if (command.category === category) {
                results.push(command);
            }
        }
        return results;
    }
    getCommand(name) {
        return this._commands.get(name);
    }
    getICommand(name) {
        return this.commands.find((command) => { var _a; return (_a = command.names) === null || _a === void 0 ? void 0 : _a.includes(name); });
    }
    fetchDisabledCommands() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield disabledCommands.find({});
            for (const result of results) {
                const { guildId, command } = result;
                (_a = this._commands.get(command)) === null || _a === void 0 ? void 0 : _a.disable(guildId);
            }
        });
    }
    fetchRequiredRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield requiredRoles.find({});
            for (const result of results) {
                const { guildId, command, requiredRoles } = result;
                const cmd = this._commands.get(command);
                if (cmd) {
                    for (const roleId of requiredRoles) {
                        cmd.addRequiredRole(guildId, roleId);
                    }
                }
            }
        });
    }
    fetchChannelOnly() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield channelCommands.find({});
            for (const result of results) {
                const { command, guildId, channels } = result;
                const cmd = this._commands.get(command);
                if (!cmd) {
                    continue;
                }
                const guild = (_a = this._client) === null || _a === void 0 ? void 0 : _a.guilds.cache.get(guildId);
                if (!guild) {
                    continue;
                }
                cmd.setRequiredChannels(guild, command, channels
                    .toString()
                    .replace(/\"\[\]/g, "")
                    .split(","));
            }
        });
    }
}
