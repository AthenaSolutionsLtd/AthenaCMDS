import { Guild } from 'discord.js'
import AthenaHandler from '..'
import Command from '../Command'

export = (guild: Guild | null, command: Command, instance: AthenaHandler) => {
  const { testOnly } = command

  if (!testOnly) {
    return true
  }

  return guild && instance.testServers.includes(guild.id)
}
