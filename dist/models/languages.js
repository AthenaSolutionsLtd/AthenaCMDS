import mongoose, { Schema } from "mongoose";
const reqString = {
    type: String,
    required: true,
};
const schema = new Schema({
    // GuildID
    _id: reqString,
    language: reqString,
});
const name = "AthenaCMDS-languages";
