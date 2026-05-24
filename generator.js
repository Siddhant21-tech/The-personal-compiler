import { callLLM } from '../utils/llm.js';

const SYSTEM_PROMPT = `
You are Stage 3 (Schema Generation) of a software generation compiler.
Your task is to take a system architecture design and generate four strict, complete, and reliable configurations:
1. UI Schema: Pages, layout structure, sidebar components, and interactive parts (Forms, Tables, Charts, Buttons) mapping to API triggers.
2. API Schema: REST endpoints, HTTP methods, request/response models, validations, and query parameters.
3. DB Schema: Relational tables, columns with strict SQL-like data-types (VARCHAR, INTEGER, TEXT, DECIMAL, etc.), and foreign key references.
4. Auth Rules: Gatekeeping maps linking endpoints, operations, and UI pages to specific allowed user roles.

You MUST output ONLY a valid JSON object matching the following structure. Do not wrap in markdown or add explanations.

{
  "uiSchema": {
    "pages": [
      {
        "name": "string (lowercase, e.g. dashboard, contacts)",
        "title": "string (Title format)",
        "components": [
          {
            "id": "unique-id",
            "type": "Form | Table | Grid | ValueCard | BarChart | Kanban | Button",
            "title": "string", // optional
            "apiSource": "/api/... (GET endpoints to pull data, optional)",
            "triggerApi": "/api/... (POST/PUT/DELETE endpoints to send data, optional)",
            "fields": ["list", "of", "input", "fields"], // for forms/grids
            "columns": ["list", "of", "fields", "to", "display"], // for tables
            "actions": ["Edit", "Delete"], // actions on table/grids
            "xField": "field_name", // for charts
            "yField": "field_name", // for charts
            "stages": ["list", "of", "kanban", "stages"] // for kanban
          }
        ]
      }
    ]
  },
  "apiSchema": {
    "endpoints": [
      {
        "path": "/api/...",
        "method": "GET | POST | PUT | DELETE",
        "requestFields": ["field1", "field2"], // required fields in payload (optional)
        "responseFields": ["field1", "field2"] // fields in response payload
      }
    ]
  },
  "dbSchema": {
    "tables": [
      {
        "name": "table_name",
        "columns": [
          {
            "name": "column_name",
            "type": "VARCHAR(size) | INTEGER | TEXT | DECIMAL(p,s) | BOOLEAN | DATETIME",
            "primary": true, // optional
            "unique": true, // optional
            "foreignKey": "referenced_table.column_name" // optional
          }
        ]
      }
    ]
  },
  "authRules": {
    "roles": ["Role1", "Role2"],
    "gatedPaths": [
      {
        "path": "/api/...",
        "roles": ["Role1"]
      }
    ]
  }
}
`;

/**
 * Stage 3: Schema Generation
 * @param {Object} systemDesign 
 * @returns {Promise<Object>}
 */
export async function compileSchemas(systemDesign) {
  try {
    const rawResult = await callLLM(SYSTEM_PROMPT, JSON.stringify(systemDesign, null, 2), true);
    return JSON.parse(rawResult);
  } catch (error) {
    throw new Error(`Schema Generation Failed: ${error.message}`);
  }
}
