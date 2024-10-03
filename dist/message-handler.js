import languageSchema from "./models/languages";
import Logger from "./logger";
const defualtMessages = require("../messages.json");
export default class MessageHandler {
    _instance;
    _guildLanguages = new Map(); // <Guild ID, Language>
    _languages = [];
    _messages = {};
    constructor(instance, messagePath) {
        this._instance = instance;
        (async () => {
            this._messages = messagePath
                ? await import(messagePath)
                : defualtMessages;
            for (const messageId of Object.keys(this._messages)) {
                for (const language of Object.keys(this._messages[messageId])) {
                    this._languages.push(language.toLowerCase());
                }
            }
            if (!this._languages.includes(instance.defaultLanguage)) {
                new Logger("debug", "America/Chicago", "logs").log("error", "CommandHandler", `The current default language defined is not supported.`);
            }
            if (instance.isDBConnected()) {
                const results = await languageSchema.find();
                // @ts-ignore
                for (const { _id: guildId, language } of results) {
                    this._guildLanguages.set(guildId, language);
                }
            }
        })();
    }
    languages() {
        return this._languages;
    }
    async setLanguage(guild, language) {
        if (guild) {
            this._guildLanguages.set(guild.id, language);
        }
    }
    getLanguage(guild) {
        if (guild) {
            const result = this._guildLanguages.get(guild.id);
            if (result) {
                return result;
            }
        }
        return this._instance.defaultLanguage;
    }
    get(guild, messageId, args = {}) {
        const language = this.getLanguage(guild);
        const translations = this._messages[messageId];
        if (!translations) {
            new Logger("debug", "America/Chicago", "logs").log("error", "Main", `Could not find the correct message to send for "${messageId}"`);
            return "Could not find the correct message to send. Please report this to the bot developer.";
        }
        let result = translations[language];
        for (const key of Object.keys(args)) {
            const expression = new RegExp(`{${key}}`, "g");
            result = result.replace(expression, args[key]);
        }
        return result;
    }
    getEmbed(guild, embedId, itemId, args = {}) {
        const language = this.getLanguage(guild);
        const items = this._messages[embedId];
        if (!items) {
            new Logger("debug", "America/Chicago", "logs").log("error", "Main", `Could not find the correct item to send for "${embedId}" -> "${itemId}"`);
            return "Could not find the correct message to send. Please report this to the bot developer.";
        }
        const translations = items[itemId];
        if (!translations) {
            new Logger("debug", "America/Chicago", "logs").log("error", "Main", `Could not find the correct message to send for "${embedId}"`);
            return "Could not find the correct message to send. Please report this to the bot developer.";
        }
        let result = translations[language];
        for (const key of Object.keys(args)) {
            const expression = new RegExp(`{${key}}`, "g");
            result = result.replace(expression, args[key]);
        }
        return result;
    }
}
