import { MessageEmbed } from "discord.js";
import Logger from "../../logger";
import getFirstEmbed from "./!get-first-embed";
import ReactionListener, { addReactions } from "./!ReactionListener";
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
        client.on("messageReactionAdd", async (reaction, user) => {
            new ReactionListener(instance, reaction, user);
        });
    },
    callback: (options) => {
        const { message, channel, instance, args } = options;
        const { guild } = channel;
        if (guild && !guild.me?.permissions.has("SEND_MESSAGES")) {
            new Logger("debug", "America/Chicago", "logs").log("debug", "Main", `Could not send message due to no permissions in channel for ${guild.name}`);
            return;
        }
        if (guild && !guild.me?.permissions.has("ADD_REACTIONS")) {
            return instance.messageHandler.get(guild, "NO_REACT_PERMS");
        }
        // Typical "!help" syntax for the menu
        if (args.length === 0) {
            sendHelpMenu(message, instance);
            return;
        }
        // If the user is looking for info on a specific command
        // Ex: "!help prefix"
        const arg = args.shift()?.toLowerCase();
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
