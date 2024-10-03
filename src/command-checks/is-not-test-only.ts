import { Guild } from "discord.js";
import AthenaCMDS from "..";
import Command from "../Command.js";

export default (
  guild: Guild | null,
  command: Command,
  instance: AthenaCMDS
) => {
  const { testOnly } = command;

  if (!testOnly) {
    return true;
  }

  return guild && instance.testServers.includes(guild.id);
};
