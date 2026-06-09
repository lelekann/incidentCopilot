import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "./env.js";

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
export const MODEL = OPENAI_MODEL;