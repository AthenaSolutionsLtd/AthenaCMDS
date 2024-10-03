var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MessageEmbed } from "discord.js";
import Logger from "../../logger.js";
import getFirstEmbed from "./!get-first-embed.js";
import ReactionListener, { addReactions } from "./!ReactionListener.js";
const sendHelpMenu = (message, instance) => {
    const { embed, reactions } = getFirstEmbed(message, instance);
    message.channel
        .send({
        embeds: [embed],
    })
        .then((message) => {
        addReactions(message, reactions);
    });
};
module.exports = {
    description: "Displays this bot's commands",
    category: "Help",
    aliases: "commands",
    maxArgs: 1,
    expectedArgs: "[command]",
    init: (client, instance) => {
        client.on("messageReactionAdd", (reaction, user) => __awaiter(void 0, void 0, void 0, function* () {
            new ReactionListener(instance, reaction, user);
        }));
    },
    callback: (options) => {
        var _a, _b, _c;
        const { message, channel, instance, args } = options;
        const { guild } = channel;
        if (guild && !((_a = guild.me) === null || _a === void 0 ? void 0 : _a.permissions.has("SEND_MESSAGES"))) {
            new Logger("debug", "America/Chicago", "logs").log("debug", "Main", `Could not send message due to no permissions in channel for ${guild.name}`);
            return;
        }
        if (guild && !((_b = guild.me) === null || _b === void 0 ? void 0 : _b.permissions.has("ADD_REACTIONS"))) {
            return instance.messageHandler.get(guild, "NO_REACT_PERMS");
        }
        // Typical "!help" syntax for the menu
        if (args.length === 0) {
            sendHelpMenu(message, instance);
            return;
        }
        // If the user is looking for info on a specific command
        // Ex: "!help prefix"
        const arg = (_c = args.shift()) === null || _c === void 0 ? void 0 : _c.toLowerCase();
        const command = instance.commandHandler.getICommand(arg);
        if (!command) {
            return instance.messageHandler.get(guild, "UNKNOWN_COMMAND", {
                COMMAND: arg,
            });
        }
        const description = ReactionListener.getHelp(command, instance, guild);
        const embed = new MessageEmbed()
            .setTitle(`${instance.displayName} ${instance.messageHandler.getEmbed(guild, "HELP_MENU", "TITLE")} - ${arg}`)
            .setDescription(description);
        if (instance.color) {
            embed.setColor(instance.color);
        }
        return embed;
    },
};
