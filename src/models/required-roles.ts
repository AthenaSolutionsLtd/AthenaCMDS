import mongoose, { Schema } from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const schema = new Schema({
  guildId: reqString,
  command: reqString,
  requiredRoles: {
    type: [String],
    required: true,
  },
});

const name = "AthenaCMDS-required-roles";

export default mongoose.models[name] || mongoose.model(name, schema, name);
