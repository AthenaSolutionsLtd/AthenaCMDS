var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from "discord.js";
export default {
    description: "Allows the bot developers to manage existing slash commands",
    category: "Configuration",
    permissions: ["ADMINISTRATOR"],
    maxArgs: 1,
    expectedArgs: "[command-id]",
    ownerOnly: true,
    hidden: true,
    slash: "both",
    callback: (options) => __awaiter(void 0, void 0, void 0, function* () {
        const { channel, instance, text } = options;
        const { guild } = channel;
        const { slashCommands } = instance;
        const global = yield slashCommands.get();
        if (text) {
            let useGuild = true;
            try {
                global === null || global === void 0 ? void 0 : global.forEach((cmd) => {
                    if (cmd.id === text) {
                        useGuild = false;
                        throw new Error("");
                    }
                });
            }
            catch (ignored) { }
            slashCommands.delete(text, useGuild ? guild.id : undefined);
            if (useGuild) {
                return `Slash command with the ID "${text}" has been deleted from guild "${guild.id}".`;
            }
            return `Slash command with the ID "${text}" has been deleted. This may take up to 1 hour to be seen on all servers using your bot.`;
        }
        let counter = 0;
        let allSlashCommands = [];
        if (global.size) {
            global.forEach((cmd) => {
                var _a, _b;
                if (cmd && cmd.name) {
                    const newString = `${cmd.name}: ${cmd.id}\n`;
                    if ((allSlashCommands[counter] || []).length + newString.length <
                        1024) {
                        (_a = allSlashCommands[counter]) !== null && _a !== void 0 ? _a : (allSlashCommands[counter] = "");
                        allSlashCommands[counter] += newString;
                    }
                    else {
                        ++counter;
                        (_b = allSlashCommands[counter]) !== null && _b !== void 0 ? _b : (allSlashCommands[counter] = "");
                        allSlashCommands[counter] += newString;
                    }
                }
            });
        }
        else {
            allSlashCommands.push("None");
        }
        const embed = new EmbedBuilder().addField("How to delete a slash command:", `${instance.getPrefix(guild)}slash <command-id>`);
        for (let a = 0; a < allSlashCommands.length; ++a) {
            embed.addField(`Global slash commands:${a === 0 ? "" : " (Continued)"}`, allSlashCommands[a]);
        }
        if (guild) {
            const guildOnly = yield slashCommands.get(guild.id);
            counter = 0;
            let guildOnlyCommands = [];
            if (guildOnly.size) {
                guildOnly.forEach((cmd) => {
                    var _a, _b;
                    if (cmd && cmd.name) {
                        const newString = `${cmd.name}: ${cmd.id}\n`;
                        if ((guildOnlyCommands[counter] || []).length + newString.length <
                            1024) {
                            (_a = guildOnlyCommands[counter]) !== null && _a !== void 0 ? _a : (guildOnlyCommands[counter] = "");
                            guildOnlyCommands[counter] += newString;
                        }
                        else {
                            ++counter;
                            (_b = guildOnlyCommands[counter]) !== null && _b !== void 0 ? _b : (guildOnlyCommands[counter] = "");
                            guildOnlyCommands[counter] += newString;
                        }
                    }
                });
            }
            else {
                guildOnlyCommands[0] = "None";
            }
            for (let a = 0; a < guildOnlyCommands.length; ++a) {
                embed.addField(`Guild slash commands:${a === 0 ? "" : " (Continued)"}`, guildOnlyCommands[a]);
            }
        }
        if (instance.color) {
            embed.setColor(instance.color);
        }
        return embed;
    }),
};
