import { callLLM } from '../utils/llm.js';

const SYSTEM_PROMPT = `
You are Stage 1 (Intent Extraction) of a software generation compiler.
Your task is to parse open-ended natural language requirements into a highly structured Intermediate Representation (IR).

You MUST output ONLY a valid JSON object matching the following structure. No markdown wrappers, no extra text.

{
  "appName": "Name of the app",
  "tagline": "A single line summary describing what it does",
  "targetAudience": "Who are the primary users of this application",
  "coreFeatures": [
    "Feature item 1",
    "Feature item 2"
  ],
  "userRoles": ["Admin", "SalesAgent", "StandardUser"], // The set of security roles required
  "gatedFeatures": [
    { "feature": "Name of the gated action", "roles": ["Admin"] }
  ],
  "pagesRequired": ["login", "dashboard", "contacts", "settings"] // List of distinct UI pages needed
}

Keep intent extraction highly deterministic, extracting exactly the core intent, requirements, and structural necessities.
`;

/**
 * Stage 1: Intent Extraction
 * @param {string} prompt 
 * @returns {Promise<Object>}
 */
export async function compileIntent(prompt) {
  try {
    const rawResult = await callLLM(SYSTEM_PROMPT, prompt, true);
    return JSON.parse(rawResult);
  } catch (error) {
    throw new Error(`Intent Extraction Failed: ${error.message}`);
  }
}
