var Events;
(function (Events) {
    Events["DATABASE_CONNECTED"] = "databaseConnected";
    Events["LANGUAGE_NOT_SUPPORTED"] = "languageNotSupported";
    Events["COMMAND_EXCEPTION"] = "commandException";
})(Events || (Events = {}));
export default Events;
