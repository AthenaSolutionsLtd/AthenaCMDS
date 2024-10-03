var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prefixes from "../models/prefixes.js";
export default {
    description: "Displays or sets the prefix for the current guild",
    category: "Configuration",
    permissions: ["ADMINISTRATOR"],
    maxArgs: 1,
    expectedArgs: "[prefix]",
    cooldown: "2s",
    slash: "both",
    callback: (options) => __awaiter(void 0, void 0, void 0, function* () {
        const { channel, args, text, instance } = options;
        const { guild } = channel;
        if (args.length === 0) {
            return instance.messageHandler.get(guild, "CURRENT_PREFIX", {
                PREFIX: instance.getPrefix(guild),
            });
        }
        if (guild) {
            const { id } = guild;
            if (!instance.isDBConnected()) {
                return instance.messageHandler.get(guild, "NO_DATABASE_FOUND");
            }
            yield prefixes.findOneAndUpdate({
                _id: id,
            }, {
                _id: id,
                prefix: text,
            }, {
                upsert: true,
            });
            instance.setPrefix(guild, text);
            return instance.messageHandler.get(guild, "SET_PREFIX", {
                PREFIX: text,
            });
        }
        return instance.messageHandler.get(guild, "CANNOT_SET_PREFIX_IN_DMS");
    }),
};
