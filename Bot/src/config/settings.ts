import { config } from "dotenv";

config();

export const settings = {
    botToken: process.env.TG_TOKEN || "",
    botVersion: "1.0.1",
    adminIds: [69884361]
};
