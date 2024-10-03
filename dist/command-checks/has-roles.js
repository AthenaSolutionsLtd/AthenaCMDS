var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CommandErrors from "../enums/CommandErrors.js";
export default (guild, command, instance, member, user, reply) => __awaiter(void 0, void 0, void 0, function* () {
    if (!guild || !member) {
        return true;
    }
    const { error } = command;
    const roles = command.getRequiredRoles(guild.id);
    if (roles && roles.length) {
        const missingRoles = [];
        const missingRolesNames = [];
        for (const role of roles) {
            const realRole = yield guild.roles.fetch(role);
            if (realRole !== null && !member.roles.cache.has(role)) {
                missingRoles.push(role);
                missingRolesNames.push(realRole.name);
            }
        }
        if (missingRoles.length) {
            if (error) {
                error({
                    error: CommandErrors.MISSING_ROLES,
                    command,
                    message: null,
                    info: {
                        missingRoles,
                    },
                });
            }
            else {
                reply(instance.messageHandler.get(guild, "MISSING_ROLES", {
                    ROLES: missingRolesNames.join(", "),
                })).then((message) => {
                    if (!message) {
                        return;
                    }
                    if (instance.delErrMsgCooldown === -1 || !message.deletable) {
                        return;
                    }
                    setTimeout(() => {
                        message.delete();
                    }, 1000 * instance.delErrMsgCooldown);
                });
            }
            return false;
        }
    }
    else if (command.doesRequireRoles) {
        reply(instance.messageHandler.get(guild, "REQUIRE_ROLES", {
            PREFIX: instance.getPrefix(guild),
            COMMAND: command.names[0],
        })).then((message) => {
            if (!message) {
                return;
            }
            if (instance.delErrMsgCooldown === -1 || !message.deletable) {
                return;
            }
            setTimeout(() => {
                message.delete();
            }, 1000 * instance.delErrMsgCooldown);
        });
        return false;
    }
    return true;
});
