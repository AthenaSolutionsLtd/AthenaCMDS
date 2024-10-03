var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import Events from "./enums/Events";
const results = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
};
export default (mongoPath, instance, dbOptions = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign({ keepAlive: true }, dbOptions);
    mongoose.set(`strictQuery`, true);
    yield mongoose.connect(mongoPath, options);
    const { connection } = mongoose;
    const state = results[connection.readyState] || "Unknown";
    instance.emit(Events.DATABASE_CONNECTED, connection, state);
});
export const getMongoConnection = () => {
    return mongoose.connection;
};
