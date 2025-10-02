import mongoose, { Schema, version } from "mongoose";
import { Timestamp } from './../../../node_modules/bson/src/timestamp';

const publisherSchema = new mongoose.Schema(
    {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
    website: String,
    },
    {
        Timestamp: true,
        versionKey: false,
    }
);
const Publisher = mongoose.model("Publisher", publisherSchema);
export default Publisher;