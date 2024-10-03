var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import requiredRoleSchema from "../models/required-roles.js";
export default {
    description: "Specifies what role each command requires.",
    category: "Configuration",
    permissions: ["ADMINISTRATOR"],
    aliases: ["requiredroles", "requirerole", "requireroles"],
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: "<command> <none-or-roleid>",
    cooldown: "2s",
    slash: "both",
    callback: (options) => __awaiter(void 0, void 0, void 0, function* () {
        const { channel, args, instance } = options;
        const name = (args.shift() || "").toLowerCase();
        const roleId = (args.shift() || "").toLowerCase();
        const { guild } = channel;
        if (!guild) {
            return instance.messageHandler.get(guild, "CANNOT_CHANGE_REQUIRED_ROLES_IN_DMS");
        }
        if (!instance.isDBConnected()) {
            return instance.messageHandler.get(guild, "NO_DATABASE_FOUND");
        }
        const command = instance.commandHandler.getCommand(name);
        if (command) {
            if (roleId === "none") {
                command.removeRequiredRole(guild.id, roleId);
                yield requiredRoleSchema.deleteOne({
                    guildId: guild.id,
                    command: command.names[0],
                });
                return instance.messageHandler.get(guild, "REMOVED_ALL_REQUIRED_ROLES", {
                    COMMAND: command.names[0],
                });
            }
            command.addRequiredRole(guild.id, roleId);
            yield requiredRoleSchema.findOneAndUpdate({
                guildId: guild.id,
                command: command.names[0],
            }, {
                guildId: guild.id,
                command: command.names[0],
                $addToSet: {
                    requiredRoles: roleId,
                },
            }, {
                upsert: true,
            });
            return instance.messageHandler.get(guild, "ADDED_REQUIRED_ROLE", {
                ROLE: roleId,
                COMMAND: command.names[0],
            });
        }
        return instance.messageHandler.get(guild, "UNKNOWN_COMMAND", {
            COMMAND: name,
        });
    }),
};
