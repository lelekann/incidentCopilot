import { config } from "dotenv";
 
config();
 
export const PORT = process.env.PORT || 3001;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";