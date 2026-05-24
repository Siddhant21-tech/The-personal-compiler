/**
 * Validates the compiler schemas for structural, syntax, and semantic correctness.
 * Returns an array of error objects with details.
 * 
 * @param {Object} schemas 
 * @returns {Object} { isValid: boolean, errors: Array<{ type: string, message: string, component: string }> }
 */
export function validateSchemas(schemas) {
  const errors = [];

  // 1. Structure Verification
  if (!schemas) {
    return {
      isValid: false,
      errors: [{ type: "Structural", message: "Schemas object is null or undefined." }]
    };
  }

  const requiredRootKeys = ["uiSchema", "apiSchema", "dbSchema", "authRules"];
  for (const key of requiredRootKeys) {
    if (!schemas[key]) {
      errors.push({
        type: "Structural",
        message: `Missing root-level schema module: '${key}'`
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const { uiSchema, apiSchema, dbSchema, authRules } = schemas;

  // 2. Local module sub-structure check
  if (!uiSchema.pages || !Array.isArray(uiSchema.pages)) {
    errors.push({ type: "Structural", message: "uiSchema is missing an array of 'pages'" });
  }
  if (!apiSchema.endpoints || !Array.isArray(apiSchema.endpoints)) {
    errors.push({ type: "Structural", message: "apiSchema is missing an array of 'endpoints'" });
  }
  if (!dbSchema.tables || !Array.isArray(dbSchema.tables)) {
    errors.push({ type: "Structural", message: "dbSchema is missing an array of 'tables'" });
  }
  if (!authRules.roles || !Array.isArray(authRules.roles)) {
    errors.push({ type: "Structural", message: "authRules is missing an array of 'roles'" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // 3. Cross-layer Semantic Rules
  const apiPaths = new Set(apiSchema.endpoints.map(e => e.path));
  const dbTableNames = new Set(dbSchema.tables.map(t => t.name.toLowerCase()));
  
  // Map tables to columns
  const dbTableColumns = {};
  dbSchema.tables.forEach(t => {
    dbTableColumns[t.name.toLowerCase()] = new Set(t.columns.map(c => c.name.toLowerCase()));
  });

  // A. UI-to-API check
  uiSchema.pages.forEach(page => {
    if (page.components && Array.isArray(page.components)) {
      page.components.forEach(comp => {
        // Validate GET source
        if (comp.apiSource && !apiPaths.has(comp.apiSource)) {
          errors.push({
            type: "SemanticMismatch",
            component: `Page: ${page.name} -> Component: ${comp.id}`,
            message: `UI Component '${comp.id}' reads from API '${comp.apiSource}' but this path is not defined in the API Schema.`
          });
        }
        // Validate POST/PUT trigger
        if (comp.triggerApi && !apiPaths.has(comp.triggerApi)) {
          errors.push({
            type: "SemanticMismatch",
            component: `Page: ${page.name} -> Component: ${comp.id}`,
            message: `UI Component '${comp.id}' triggers API '${comp.triggerApi}' but this path is not defined in the API Schema.`
          });
        }

        // Validate that fields map to a DB table if it's named similarly (heuristics check)
        const possibleTableName = page.name.toLowerCase(); // e.g. "contacts" page usually relates to "contacts" table
        if (dbTableNames.has(possibleTableName)) {
          const tableCols = dbTableColumns[possibleTableName];
          
          if (comp.columns && Array.isArray(comp.columns)) {
            comp.columns.forEach(col => {
              if (col !== "actions" && col !== "Edit" && col !== "Delete" && !tableCols.has(col.toLowerCase())) {
                errors.push({
                  type: "SemanticMismatch",
                  component: `Page: ${page.name} -> Component: ${comp.id}`,
                  message: `UI Table column '${col}' in page '${page.name}' does not map to any database column in table '${possibleTableName}'.`
                });
              }
            });
          }

          if (comp.fields && Array.isArray(comp.fields)) {
            comp.fields.forEach(field => {
              if (!tableCols.has(field.toLowerCase())) {
                errors.push({
                  type: "SemanticMismatch",
                  component: `Page: ${page.name} -> Component: ${comp.id}`,
                  message: `UI Form field '${field}' in page '${page.name}' does not map to any database column in table '${possibleTableName}'.`
                });
              }
            });
          }
        }
      });
    }
  });

  // B. Auth rules check
  if (authRules.gatedPaths && Array.isArray(authRules.gatedPaths)) {
    authRules.gatedPaths.forEach(g => {
      if (!apiPaths.has(g.path)) {
        errors.push({
          type: "SemanticMismatch",
          component: "AuthRules -> gatedPaths",
          message: `Auth Rules gate access to API path '${g.path}' but this path does not exist in the API Schema.`
        });
      }
      
      if (g.roles && Array.isArray(g.roles)) {
        g.roles.forEach(role => {
          if (!authRules.roles.includes(role)) {
            errors.push({
              type: "SemanticMismatch",
              component: "AuthRules -> roles",
              message: `Auth rule gates path '${g.path}' with undefined role '${role}'.`
            });
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
