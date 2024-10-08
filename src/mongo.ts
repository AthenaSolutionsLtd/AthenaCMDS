import mongoose, { Connection } from "mongoose";
import AthenaCMDS from ".";
import Events from "./enums/Events";

const results: {
  [name: number]: string;
} = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

export default async (
  mongoPath: string,
  instance: AthenaCMDS,
  dbOptions = {}
) => {
  const options = {
    keepAlive: true,
    ...dbOptions,
  };
  mongoose.set(`strictQuery`, true);
  await mongoose.connect(mongoPath, options);

  const { connection } = mongoose;
  const state = results[connection.readyState] || "Unknown";
  instance.emit(Events.DATABASE_CONNECTED, connection, state);
};

export const getMongoConnection = (): Connection => {
  return mongoose.connection;
};
