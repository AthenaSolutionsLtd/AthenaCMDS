var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import getAllFiles from "./get-all-files.js";
import Logger from "./logger/index.js";
class SlashCommands {
    constructor(instance, listen, typeScript) {
        this._commandChecks = new Map();
        this._instance = instance;
        this._client = instance.client;
        this.setUp(listen, typeScript);
    }
    setUp(listen, typeScript = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Do not pass in TS here because this should always compiled to JS
            for (const [file, fileName] of getAllFiles(path.join(__dirname, "command-checks"))) {
                this._commandChecks.set(fileName, require(file));
            }
            const replyFromCheck = (reply, interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!reply) {
                    return new Promise((resolve) => {
                        resolve("No reply provided.");
                    });
                }
                if (typeof reply === "string") {
                    return interaction.reply({
                        content: reply,
                        ephemeral: this._instance.ephemeral,
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
                    return interaction.reply({
                        embeds,
                        ephemeral: this._instance.ephemeral,
                    });
                }
            });
            if (listen) {
                this._client.on("interactionCreate", (interaction) => __awaiter(this, void 0, void 0, function* () {
                    if (!interaction.isCommand()) {
                        return;
                    }
                    const { user, commandName, options, guild, channelId } = interaction;
                    const member = interaction.member;
                    const channel = (guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(channelId)) || null;
                    const command = this._instance.commandHandler.getCommand(commandName);
                    if (!command) {
                        interaction.reply({
                            content: this._instance.messageHandler.get(guild, "INVALID_SLASH_COMMAND"),
                            ephemeral: this._instance.ephemeral,
                        });
                        return;
                    }
                    const args = [];
                    options.data.forEach(({ value }) => {
                        args.push(String(value));
                    });
                    for (const [checkName, checkFunction,] of this._commandChecks.entries()) {
                        if (!(yield checkFunction(guild, command, this._instance, member, user, (reply) => {
                            return replyFromCheck(reply, interaction);
                        }, args, commandName, channel))) {
                            return;
                        }
                    }
                    this.invokeCommand(interaction, commandName, options, args);
                }));
            }
        });
    }
    getCommands(guildId) {
        var _a, _b;
        if (guildId) {
            return (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
        }
        return (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
    }
    get(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = this.getCommands(guildId);
            if (commands) {
                // @ts-ignore
                yield commands.fetch();
                return commands.cache;
            }
            return new Map();
        });
    }
    didOptionsChange(command, options) {
        var _a;
        return (((_a = command.options) === null || _a === void 0 ? void 0 : _a.filter((opt, index) => {
            var _a, _b, _c;
            return ((opt === null || opt === void 0 ? void 0 : opt.required) !== ((_a = options[index]) === null || _a === void 0 ? void 0 : _a.required) &&
                (opt === null || opt === void 0 ? void 0 : opt.name) !== ((_b = options[index]) === null || _b === void 0 ? void 0 : _b.name) &&
                ((_c = opt === null || opt === void 0 ? void 0 : opt.options) === null || _c === void 0 ? void 0 : _c.length) !== options.length);
        }).length) !== 0);
    }
    create(name, description, options, guildId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let commands;
            if (guildId) {
                commands = (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
            }
            else {
                commands = (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
            }
            if (!commands) {
                return;
            }
            // @ts-ignore
            yield commands.fetch();
            const cmd = commands.cache.find((cmd) => cmd.name === name);
            if (cmd) {
                const optionsChanged = this.didOptionsChange(cmd, options);
                if (cmd.description !== description ||
                    cmd.options.length !== options.length ||
                    optionsChanged) {
                    new Logger("debug", "America/Chicago", "logs").log("debug", "Main", `Updating${guildId ? " guild" : ""} slash command "${name}"`);
                    return commands === null || commands === void 0 ? void 0 : commands.edit(cmd.id, {
                        name,
                        description,
                        options,
                    });
                }
                return Promise.resolve(cmd);
            }
            if (commands) {
                new Logger("debug", "America/Chicago", "logs").log("success", "Main", `Creating${guildId ? " guild" : ""} slash command "${name}"`);
                const newCommand = yield commands.create({
                    name,
                    description,
                    options,
                });
                return newCommand;
            }
            return Promise.resolve(undefined);
        });
    }
    delete(commandId, guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = this.getCommands(guildId);
            if (commands) {
                const cmd = commands.cache.get(commandId);
                if (cmd) {
                    new Logger("debug", "America/Chicago", "logs").log("success", "Main", `Deleting${guildId ? " guild" : ""} slash command "${cmd.name}"`);
                    cmd.delete();
                }
            }
            return Promise.resolve(undefined);
        });
    }
    invokeCommand(interaction, commandName, options, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = this._instance.commandHandler.getCommand(commandName);
            if (!command || !command.callback) {
                return;
            }
            const reply = yield command.callback({
                member: interaction.member,
                guild: interaction.guild,
                channel: interaction.channel,
                args,
                text: args.join(" "),
                client: this._client,
                instance: this._instance,
                interaction,
                options,
                user: interaction.user,
            });
            if (reply) {
                if (typeof reply === "string") {
                    interaction.reply({
                        content: reply,
                    });
                }
                else if (typeof reply === "object") {
                    if (reply.custom) {
                        interaction.reply(reply);
                    }
                    else {
                        let embeds = [];
                        if (Array.isArray(reply)) {
                            embeds = reply;
                        }
                        else {
                            embeds.push(reply);
                        }
                        interaction.reply({ embeds });
                    }
                }
            }
        });
    }
}
export default SlashCommands;
