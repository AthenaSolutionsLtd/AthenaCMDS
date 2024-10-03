import CommandErrors from "../enums/CommandErrors.js";
/**
 * Checks if the given command is enabled in the current guild
 */
export default (guild, command, instance, member, user, reply) => {
    if (!guild || !command.isDisabled(guild.id)) {
        return true;
    }
    const { error } = command;
    if (error) {
        error({
            error: CommandErrors.COMMAND_DISABLED,
            command,
        });
    }
    else {
        reply(instance.messageHandler.get(guild, "DISABLED_COMMAND")).then((message) => {
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
};
