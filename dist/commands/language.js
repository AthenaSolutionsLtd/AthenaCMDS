var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import languageSchema from "../models/languages.js";
import Events from "../enums/Events.js";
export default {
    description: "Displays or sets the language for this Discord server",
    category: "Configuration",
    aliases: ["lang"],
    permissions: ["ADMINISTRATOR"],
    maxArgs: 1,
    expectedArgs: "[language]",
    cooldown: "2s",
    slash: "both",
    callback: (options) => __awaiter(void 0, void 0, void 0, function* () {
        const { channel, text, instance } = options;
        const { guild } = channel;
        if (!guild) {
            return;
        }
        const { messageHandler } = instance;
        if (!instance.isDBConnected()) {
            return instance.messageHandler.get(guild, "NO_DATABASE_FOUND");
        }
        const lang = text.toLowerCase();
        if (!lang) {
            return instance.messageHandler.get(guild, "CURRENT_LANGUAGE", {
                LANGUAGE: instance.messageHandler.getLanguage(guild),
            });
        }
        if (!messageHandler.languages().includes(lang)) {
            instance.emit(Events.LANGUAGE_NOT_SUPPORTED, guild, lang);
            return messageHandler.get(guild, "LANGUAGE_NOT_SUPPORTED", {
                LANGUAGE: lang,
            });
        }
        instance.messageHandler.setLanguage(guild, lang);
        yield languageSchema.findOneAndUpdate({
            _id: guild.id,
        }, {
            _id: guild.id,
            language: lang,
        }, {
            upsert: true,
        });
        return instance.messageHandler.get(guild, "NEW_LANGUAGE", {
            LANGUAGE: lang,
        });
    }),
};
