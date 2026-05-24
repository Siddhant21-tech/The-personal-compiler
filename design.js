import { callLLM } from '../utils/llm.js';

const SYSTEM_PROMPT = `
You are Stage 2 (System Design Layer) of a software generation compiler.
Your task is to take a structured Intermediate Representation (IR) of an application's intent and convert it into a complete system architecture.

You MUST output ONLY a valid JSON object matching the following structure. No explanation, no extra text.

{
  "entities": [
    {
      "name": "EntityName", // e.g. User, Contact, Deal
      "fields": [
        { 
          "name": "fieldName", 
          "type": "UUID | String | Decimal | DateTime | Integer", 
          "isPrimary": true, // (optional)
          "unique": true, // (optional)
          "references": "OtherEntity.id" // foreign key reference (optional)
        }
      ]
    }
  ],
  "flows": [
    {
      "name": "Process Flow Name",
      "steps": [
        "Step 1: User does X",
        "Step 2: API triggers Y",
        "Step 3: Database updates Z"
      ]
    }
  ],
  "accessMatrix": {
    "RoleName1": { "EntityName1": "CRUD", "EntityName2": "R" },
    "RoleName2": { "EntityName1": "R", "EntityName2": "NONE" }
  }
}
`;

/**
 * Stage 2: System Design
 * @param {Object} intentIR 
 * @returns {Promise<Object>}
 */
export async function compileSystemDesign(intentIR) {
  try {
    const rawResult = await callLLM(SYSTEM_PROMPT, JSON.stringify(intentIR, null, 2), true);
    return JSON.parse(rawResult);
  } catch (error) {
    throw new Error(`System Design Compilation Failed: ${error.message}`);
  }
}
