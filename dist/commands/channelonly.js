var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import channelCommandSchema from "../models/channel-commands.js";
export default {
    description: "Makes a command only work in some channels.",
    category: "Configuration",
    permissions: ["ADMINISTRATOR"],
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: "<Command name> [Channel tag]",
    cooldown: "2s",
    guildOnly: true,
    slash: "both",
    options: [
        {
            name: "command",
            description: "The command name",
            type: "STRING",
            required: true,
        },
        {
            name: "channel",
            description: "The tag of the channel",
            type: "CHANNEL",
            required: false,
        },
    ],
    callback: (options) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, channel, args, instance, interaction } = options;
        const { guild } = channel;
        const { messageHandler } = instance;
        let commandName = (args.shift() || "").toLowerCase();
        const command = instance.commandHandler.getCommand(commandName);
        if (!instance.isDBConnected()) {
            return messageHandler.get(guild, "NO_DATABASE_FOUND");
        }
        if (!command || !command.names) {
            return messageHandler.get(guild, "UNKNOWN_COMMAND", {
                COMMAND: commandName,
            });
        }
        commandName = command.names[0];
        if (args.length === 0) {
            const results = yield channelCommandSchema.deleteMany({
                guildId: guild === null || guild === void 0 ? void 0 : guild.id,
                command: commandName,
            });
            // @ts-ignore
            if (results.n === 0) {
                return messageHandler.get(guild, "NOT_CHANNEL_COMMAND");
            }
            command.setRequiredChannels(guild, commandName, []);
            return messageHandler.get(guild, "NO_LONGER_CHANNEL_COMMAND");
        }
        if ((message === null || message === void 0 ? void 0 : message.mentions.channels.size) === 0) {
            return messageHandler.get(guild, "NO_TAGGED_CHANNELS");
        }
        let channels;
        if (message) {
            channels = Array.from(message.mentions.channels.keys());
        }
        else {
            channels = [interaction.options.getChannel("channel")];
        }
        const results = yield channelCommandSchema.findOneAndUpdate({
            guildId: guild === null || guild === void 0 ? void 0 : guild.id,
            command: commandName,
        }, {
            guildId: guild === null || guild === void 0 ? void 0 : guild.id,
            command: commandName,
            $addToSet: {
                channels,
            },
        }, {
            upsert: true,
            new: true,
        });
        if (results) {
            command.setRequiredChannels(guild, commandName, results.channels);
        }
        return messageHandler.get(guild, "NOW_CHANNEL_COMMAND", {
            COMMAND: commandName,
            CHANNELS: args.join(" "),
        });
    }),
};
