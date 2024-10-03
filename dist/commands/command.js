var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import disabledCommands from "../models/disabled-commands.js";
export default {
    description: "Enables or disables a command for this guild",
    category: "Configuration",
    permissions: ["ADMINISTRATOR"],
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: '<"enable" or "disable"> <Command Name>',
    cooldown: "2s",
    slash: "both",
    options: [
        {
            name: "action",
            description: 'Either "enable" or "disable"',
            required: true,
            type: "STRING",
            choices: [
                {
                    name: "Enable",
                    value: "enable",
                },
                { name: "Disable", value: "disable" },
            ],
        },
        {
            name: "command",
            description: "The name of the command",
            required: true,
            type: "STRING",
        },
    ],
    callback: (options) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { channel, args, instance } = options;
        const { guild } = channel;
        const newState = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const name = (args.shift() || "").toLowerCase();
        if (!guild) {
            return instance.messageHandler.get(guild, "CANNOT_ENABLE_DISABLE_IN_DMS");
        }
        if (!instance.isDBConnected()) {
            return instance.messageHandler.get(guild, "NO_DATABASE_FOUND");
        }
        if (newState !== "enable" && newState !== "disable") {
            return instance.messageHandler.get(guild, "ENABLE_DISABLE_STATE");
        }
        const command = instance.commandHandler.getCommand(name);
        if (command) {
            const mainCommand = command.names[0];
            if (mainCommand === "command") {
                return instance.messageHandler.get(guild, "CANNOT_DISABLE_THIS_COMMAND");
            }
            const isDisabled = command.isDisabled(guild.id);
            if (newState === "enable") {
                if (!isDisabled) {
                    return instance.messageHandler.get(guild, "COMMAND_ALREADY_ENABLED");
                }
                yield disabledCommands.deleteOne({
                    guildId: guild.id,
                    command: mainCommand,
                });
                command.enable(guild.id);
                return instance.messageHandler.get(guild, "COMMAND_NOW_ENABLED", {
                    COMMAND: mainCommand,
                });
            }
            if (isDisabled) {
                return instance.messageHandler.get(guild, "COMMAND_ALREADY_DISABLED");
            }
            yield new disabledCommands({
                guildId: guild.id,
                command: mainCommand,
            }).save();
            command.disable(guild.id);
            return instance.messageHandler.get(guild, "COMMAND_NOW_DISABLED", {
                COMMAND: mainCommand,
            });
        }
        return instance.messageHandler.get(guild, "UNKNOWN_COMMAND", {
            COMMAND: name,
        });
    }),
};
