import { callLLM } from '../utils/llm.js';

const SYSTEM_PROMPT = `
You are Stage 4 (Refinement Layer / Linker) of a software generation compiler.
Your task is to take the UI, API, DB, and Auth schemas generated in Stage 3 and perform a global consistency refactoring pass.

Identify and resolve all architectural inconsistencies across layers:
1. FIELD NAME ALIGNMENT: If the UI schema components display/update fields like "phone_number" or "stock", but the Database Schema defines the column as "phone" or "stock_count", you must standardize them to match EXACTLY.
2. API PATH ALIGNMENT: Ensure every API endpoint used in UI component triggers ('apiSource' or 'triggerApi') is defined with a matching path and HTTP method in the API Schema.
3. DB COLUMN ALIGNMENT: If an API endpoint request or response defines fields, check that these fields exist in the corresponding DB schema table columns.
4. AUTH GATEWAY GUARDING: Ensure that any path mentioned in 'authRules.gatedPaths' maps to a valid endpoint in the API schema, and any page mentioned in the UI schema has corresponding rules.

Return the fully refined, consistent, and validated schemas in the EXACT SAME structured JSON format. No markdown, no commentary, only the polished JSON.
`;

/**
 * Stage 4: Refinement Layer
 * @param {Object} schemas 
 * @returns {Promise<Object>}
 */
export async function refineSchemas(schemas) {
  try {
    const rawResult = await callLLM(SYSTEM_PROMPT, JSON.stringify(schemas, null, 2), true);
    return JSON.parse(rawResult);
  } catch (error) {
    throw new Error(`Schema Refinement Layer Failed: ${error.message}`);
  }
}
