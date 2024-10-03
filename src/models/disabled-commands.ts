import mongoose, { Schema } from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const schema = new Schema({
  guildId: reqString,
  command: reqString,
});

const name = "AthenaCMDS-disabled-commands";

export default mongoose.models[name] || mongoose.model(name, schema, name);
