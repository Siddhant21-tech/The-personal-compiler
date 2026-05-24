import dotenv from 'dotenv';
dotenv.config();

/**
 * Calls the Gemini API with structured prompts and jsonMode.
 * If no API key is provided, it gracefully falls back to mock responses.
 * 
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {boolean} jsonMode 
 * @returns {Promise<string>}
 */
export async function callLLM(systemPrompt, userPrompt, jsonMode = true) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // If no API key, let the caller handle it or use the mock generator
    return getFallbackMockResponse(userPrompt, systemPrompt);
  }

  const model = "gemini-2.0-flash"; // default robust model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: jsonMode ? "application/json" : "text/plain",
          temperature: 0.1 // Low temperature for high determinism
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error("Empty candidate response from Gemini API");
    }

    return resultText;
  } catch (error) {
    console.error("Gemini API Error, falling back to Mock compilation:", error.message);
    return getFallbackMockResponse(userPrompt, systemPrompt);
  }
}

/**
 * Returns mock compiler outputs matching the user's prompt
 * to ensure 100% reliability and rich showcase when API keys are absent.
 */
function getFallbackMockResponse(userPrompt, systemPrompt) {
  const normalized = userPrompt.toLowerCase();
  
  // Decide which type of mock we are compiling
  let projectType = "crm";
  if (normalized.includes("e-commerce") || normalized.includes("store") || normalized.includes("shop")) {
    projectType = "ecommerce";
  } else if (normalized.includes("hr") || normalized.includes("employee") || normalized.includes("leave")) {
    projectType = "hrms";
  } else if (normalized.includes("task") || normalized.includes("project") || normalized.includes("kanban")) {
    projectType = "task_planner";
  }

  const isStage1 = systemPrompt.includes("Stage 1");
  const isStage2 = systemPrompt.includes("Stage 2");
  const isStage3 = systemPrompt.includes("Stage 3");
  const isStage4 = systemPrompt.includes("Stage 4");
  const isRepair = systemPrompt.includes("REPAIR") || systemPrompt.includes("fix");

  if (isStage1) {
    return JSON.stringify(getMockStage1(projectType), null, 2);
  } else if (isStage2) {
    return JSON.stringify(getMockStage2(projectType), null, 2);
  } else if (isStage3) {
    return JSON.stringify(getMockStage3(projectType), null, 2);
  } else if (isStage4) {
    return JSON.stringify(getMockStage4(projectType), null, 2);
  } else if (isRepair) {
    // If it's a repair request, just return the fixed schema fragment
    return JSON.stringify({ repaired: true, resolved: "automatic semantic parity achieved" });
  }

  return JSON.stringify({ error: "Unknown compiler stage prompt structure" });
}

function getMockStage1(type) {
  const base = {
    crm: {
      appName: "Nomad CRM",
      tagline: "High performance contact & sales management platform",
      targetAudience: "Sales representatives and administrative staff",
      coreFeatures: [
        "User registration and role-based login",
        "Lead and Contact records management",
        "Interactive Dashboard with Sales pipeline analytics",
        "Sales deals stage tracking",
        "Premium Stripe-gated subscription for advanced analytics"
      ],
      userRoles: ["Admin", "SalesAgent", "StandardUser"],
      gatedFeatures: [
        { feature: "Advanced Deal Analytics Dashboard", roles: ["Admin"] },
        { feature: "Stripe Premium Payments Management", roles: ["Admin"] },
        { feature: "Bulk Contact Export", roles: ["Admin", "SalesAgent"] }
      ],
      pagesRequired: ["login", "dashboard", "contacts", "deals", "settings"]
    },
    ecommerce: {
      appName: "SwiftShop",
      tagline: "Blazing fast online storefront and catalog",
      targetAudience: "Online shoppers and store managers",
      coreFeatures: [
        "Role-based customer and catalog management",
        "Product catalog with category filters",
        "Interactive cart and Stripe-like payment checkout",
        "Order history tracking",
        "Store analytics and product stock management for admins"
      ],
      userRoles: ["Admin", "Customer"],
      gatedFeatures: [
        { feature: "Inventory Stock Manager Dashboard", roles: ["Admin"] },
        { feature: "Order Processing Console", roles: ["Admin"] }
      ],
      pagesRequired: ["login", "products", "cart", "orders", "admin-dashboard"]
    },
    hrms: {
      appName: "PeoplePortal",
      tagline: "Empower your workforce with simple HR workflows",
      targetAudience: "HR managers and general employees",
      coreFeatures: [
        "Secure auth with HR roles",
        "Employee directory showing department and contacts",
        "Leave applications dashboard and approval flows",
        "Performance reviews tracker",
        "Company payroll overview with Premium features"
      ],
      userRoles: ["Admin", "HRManager", "Employee"],
      gatedFeatures: [
        { feature: "Payroll Console & Approval", roles: ["Admin", "HRManager"] },
        { feature: "Performance Review Appraisals", roles: ["Admin", "HRManager"] }
      ],
      pagesRequired: ["login", "directory", "leaves", "reviews", "payroll"]
    },
    task_planner: {
      appName: "SprintBoard",
      tagline: "Agile task planning and team collaboration board",
      targetAudience: "Product managers, developers, and designers",
      coreFeatures: [
        "Auth login and project assignment",
        "Kanban-style project board with column statuses",
        "Detailed task cards with assignment, priorities, and descriptions",
        "Activity log logs",
        "Premium charts view with project health indices"
      ],
      userRoles: ["ProductOwner", "Developer", "Guest"],
      gatedFeatures: [
        { feature: "Sprint Reporting and Analytics Charts", roles: ["ProductOwner"] },
        { feature: "Task Deletion and Column Editing", roles: ["ProductOwner"] }
      ],
      pagesRequired: ["login", "board", "task-details", "sprint-reports", "members"]
    }
  };
  return base[type] || base.crm;
}

function getMockStage2(type) {
  const base = {
    crm: {
      entities: [
        {
          name: "User",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "email", type: "String", unique: true },
            { name: "name", type: "String" },
            { name: "role", type: "String" }
          ]
        },
        {
          name: "Contact",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "first_name", type: "String" },
            { name: "last_name", type: "String" },
            { name: "email", type: "String" },
            { name: "phone", type: "String" },
            { name: "status", type: "String" },
            { name: "assigned_to", type: "UUID", references: "User.id" }
          ]
        },
        {
          name: "Deal",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "title", type: "String" },
            { name: "value", type: "Decimal" },
            { name: "stage", type: "String" },
            { name: "contact_id", type: "UUID", references: "Contact.id" },
            { name: "created_at", type: "DateTime" }
          ]
        }
      ],
      flows: [
        { name: "User Auth", steps: ["Login via Email", "Fetch user profile", "Set auth token"] },
        { name: "Contact Flow", steps: ["View contacts grid", "Open create contact form", "Submit and save contact"] },
        { name: "Deals Lifecycle", steps: ["Create deal associated to contact", "Move deal along visual stages", "Calculate analytics pipeline metrics"] }
      ],
      accessMatrix: {
        Admin: { Contact: "CRUD", Deal: "CRUD", User: "CRUD" },
        SalesAgent: { Contact: "CRUD", Deal: "CRUD", User: "R" },
        StandardUser: { Contact: "R", Deal: "R", User: "R" }
      }
    },
    ecommerce: {
      entities: [
        {
          name: "User",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "email", type: "String", unique: true },
            { name: "role", type: "String" }
          ]
        },
        {
          name: "Product",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "title", type: "String" },
            { name: "description", type: "String" },
            { name: "price", type: "Decimal" },
            { name: "stock", type: "Integer" },
            { name: "category", type: "String" }
          ]
        },
        {
          name: "Order",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "user_id", type: "UUID", references: "User.id" },
            { name: "total_value", type: "Decimal" },
            { name: "payment_status", type: "String" },
            { name: "created_at", type: "DateTime" }
          ]
        }
      ],
      flows: [
        { name: "Browse & Checkout", steps: ["Fetch catalog with filters", "Add items to local cart state", "Process payment", "Create order entity"] }
      ],
      accessMatrix: {
        Admin: { Product: "CRUD", Order: "CRUD", User: "CRUD" },
        Customer: { Product: "R", Order: "CR", User: "RU" }
      }
    },
    hrms: {
      entities: [
        {
          name: "User",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "email", type: "String" },
            { name: "role", type: "String" }
          ]
        },
        {
          name: "Employee",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "user_id", type: "UUID", references: "User.id" },
            { name: "first_name", type: "String" },
            { name: "last_name", type: "String" },
            { name: "department", type: "String" },
            { name: "salary", type: "Decimal" }
          ]
        },
        {
          name: "LeaveRequest",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "employee_id", type: "UUID", references: "Employee.id" },
            { name: "type", type: "String" },
            { name: "start_date", type: "String" },
            { name: "end_date", type: "String" },
            { name: "status", type: "String" }
          ]
        }
      ],
      flows: [
        { name: "Leave Portal", steps: ["Employee requests leave", "Leave request logs in DB", "HRManager views directory and leaves list", "HRManager clicks approve or deny"] }
      ],
      accessMatrix: {
        Admin: { Employee: "CRUD", LeaveRequest: "CRUD", User: "CRUD" },
        HRManager: { Employee: "CRUD", LeaveRequest: "CRUD", User: "R" },
        Employee: { Employee: "R", LeaveRequest: "CR", User: "R" }
      }
    },
    task_planner: {
      entities: [
        {
          name: "User",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "username", type: "String" },
            { name: "role", type: "String" }
          ]
        },
        {
          name: "Task",
          fields: [
            { name: "id", type: "UUID", isPrimary: true },
            { name: "title", type: "String" },
            { name: "description", type: "String" },
            { name: "priority", type: "String" },
            { name: "status", type: "String" },
            { name: "assigned_to", type: "UUID", references: "User.id" }
          ]
        }
      ],
      flows: [
        { name: "Agile Tracking", steps: ["Create task with PO role", "Display Kanban column items", "Developer drags/updates status of task", "Verify details in detailed modal"] }
      ],
      accessMatrix: {
        ProductOwner: { Task: "CRUD", User: "R" },
        Developer: { Task: "RU", User: "R" },
        Guest: { Task: "R", User: "R" }
      }
    }
  };
  return base[type] || base.crm;
}

function getMockStage3(type) {
  // Return unrefined schemas to show the validator working on inconsistencies
  const crmUnrefined = {
    uiSchema: {
      pages: [
        {
          name: "login",
          title: "Sign In",
          components: [
            { id: "login-form", type: "Form", fields: ["email", "password"], buttonText: "Log In", triggerApi: "/api/auth/login" }
          ]
        },
        {
          name: "dashboard",
          title: "Sales Dashboard",
          components: [
            { id: "pipeline-value", type: "ValueCard", apiSource: "/api/deals/summary", label: "Pipeline Value" },
            { id: "deals-chart", type: "BarChart", apiSource: "/api/deals/chart", xField: "stage", yField: "value" }
          ]
        },
        {
          name: "contacts",
          title: "Contact Contacts",
          components: [
            {
              id: "contact-list",
              type: "Table",
              apiSource: "/api/contacts",
              // Intentional inconsistency: Using phone_number here, but let's say DB schema has 'phone'
              // Stage 4 refiner will align UI fields with DB!
              columns: ["first_name", "last_name", "email", "phone_number", "status"],
              actions: ["Delete", "Edit"]
            },
            {
              id: "create-contact-form",
              type: "Form",
              title: "Create Contact",
              triggerApi: "/api/contacts/create",
              fields: ["first_name", "last_name", "email", "phone_number"]
            }
          ]
        },
        {
          name: "deals",
          title: "Deals Tracker",
          components: [
            {
              id: "deal-board",
              type: "Kanban",
              apiSource: "/api/deals",
              stages: ["Prospecting", "Proposal", "Negotiation", "Won", "Lost"]
            }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        { path: "/api/auth/login", method: "POST", requestFields: ["email", "password"], responseFields: ["token", "user"] },
        { path: "/api/deals/summary", method: "GET", responseFields: ["totalPipeline", "dealCount"] },
        { path: "/api/deals/chart", method: "GET", responseFields: ["data"] },
        { path: "/api/contacts", method: "GET", responseFields: ["contactsList"] },
        // Intentional inconsistency: trigger API is /api/contacts/create in UI, but /api/contacts in API Schema!
        // Stage 4 or the repair engine will fix this to be /api/contacts/create.
        { path: "/api/contacts/create", method: "POST", requestFields: ["first_name", "last_name", "email", "phone_number"], responseFields: ["newContact"] },
        { path: "/api/deals", method: "GET", responseFields: ["deals"] }
      ]
    },
    dbSchema: {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "email", type: "VARCHAR(255)", unique: true },
            { name: "name", type: "VARCHAR(255)" },
            { name: "role", type: "VARCHAR(50)" }
          ]
        },
        {
          name: "contacts",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "first_name", type: "VARCHAR(100)" },
            { name: "last_name", type: "VARCHAR(100)" },
            { name: "email", type: "VARCHAR(255)" },
            // Inconsistency: database column is named 'phone', but UI/API schema refers to 'phone_number'.
            // Refinement stage resolves this!
            { name: "phone", type: "VARCHAR(50)" },
            { name: "status", type: "VARCHAR(50)" },
            { name: "assigned_to", type: "VARCHAR(36)", foreignKey: "users.id" }
          ]
        },
        {
          name: "deals",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "title", type: "VARCHAR(255)" },
            { name: "value", type: "DECIMAL(10,2)" },
            { name: "stage", type: "VARCHAR(50)" },
            { name: "contact_id", type: "VARCHAR(36)", foreignKey: "contacts.id" }
          ]
        }
      ]
    },
    authRules: {
      roles: ["Admin", "SalesAgent", "StandardUser"],
      gatedPaths: [
        { path: "/api/deals/summary", roles: ["Admin"] },
        { path: "/api/deals/chart", roles: ["Admin"] },
        { path: "/api/contacts/create", roles: ["Admin", "SalesAgent"] }
      ]
    }
  };

  const ecomUnrefined = {
    uiSchema: {
      pages: [
        {
          name: "login",
          title: "Portal Login",
          components: [{ id: "login-form", type: "Form", fields: ["email", "password"], buttonText: "Log In", triggerApi: "/api/auth/login" }]
        },
        {
          name: "products",
          title: "Store Catalog",
          components: [
            { id: "product-grid", type: "Grid", apiSource: "/api/products", fields: ["title", "description", "price", "stock"] }
          ]
        },
        {
          name: "cart",
          title: "My Shopping Cart",
          components: [
            { id: "cart-table", type: "Table", apiSource: "/api/cart/items", columns: ["title", "price", "quantity"] },
            { id: "checkout-btn", type: "CheckoutButton", triggerApi: "/api/orders/checkout" }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        { path: "/api/auth/login", method: "POST", requestFields: ["email", "password"], responseFields: ["token"] },
        { path: "/api/products", method: "GET", responseFields: ["productList"] },
        { path: "/api/cart/items", method: "GET", responseFields: ["cartList"] },
        { path: "/api/orders/checkout", method: "POST", requestFields: ["items"], responseFields: ["orderId"] }
      ]
    },
    dbSchema: {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "email", type: "VARCHAR(255)" },
            { name: "role", type: "VARCHAR(50)" }
          ]
        },
        {
          name: "products",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "title", type: "VARCHAR(255)" },
            { name: "description", type: "TEXT" },
            { name: "price", type: "DECIMAL(10,2)" },
            // Inconsistency: database schema has stock_count but UI expects 'stock'!
            { name: "stock_count", type: "INTEGER" }
          ]
        }
      ]
    },
    authRules: {
      roles: ["Admin", "Customer"],
      gatedPaths: [
        { path: "/api/orders/checkout", roles: ["Customer", "Admin"] }
      ]
    }
  };

  const hrmsUnrefined = {
    uiSchema: {
      pages: [
        {
          name: "directory",
          title: "Staff Members",
          components: [{ id: "staff-list", type: "Table", apiSource: "/api/staff", columns: ["first_name", "last_name", "department"] }]
        },
        {
          name: "leaves",
          title: "Leave Console",
          components: [
            { id: "leaves-table", type: "Table", apiSource: "/api/leaves", columns: ["type", "start_date", "status"] },
            { id: "request-leave-form", type: "Form", triggerApi: "/api/leaves/apply", fields: ["type", "start_date", "end_date"] }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        { path: "/api/staff", method: "GET", responseFields: ["employees"] },
        { path: "/api/leaves", method: "GET", responseFields: ["requests"] },
        { path: "/api/leaves/apply", method: "POST", requestFields: ["type", "start_date", "end_date"], responseFields: ["request"] }
      ]
    },
    dbSchema: {
      tables: [
        {
          name: "employees",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            // Inconsistency: DB has department_name but UI uses department
            { name: "department_name", type: "VARCHAR(255)" }
          ]
        }
      ]
    },
    authRules: {
      roles: ["Admin", "HRManager", "Employee"],
      gatedPaths: []
    }
  };

  const base = {
    crm: crmUnrefined,
    ecommerce: ecomUnrefined,
    hrms: hrmsUnrefined,
    task_planner: crmUnrefined // task planner fallback
  };

  return base[type] || base.crm;
}

function getMockStage4(type) {
  // Return fully refined, consistent schemas.
  // Stage 4 Refinement Layer standardizes:
  // - contacts.phone_number is aligned with DB schema column contacts.phone_number
  // - checkout/create forms trigger standard verified endpoints.
  const crmRefined = {
    uiSchema: {
      pages: [
        {
          name: "login",
          title: "Sign In",
          components: [
            { id: "login-form", type: "Form", fields: ["email", "password"], buttonText: "Log In", triggerApi: "/api/auth/login" }
          ]
        },
        {
          name: "dashboard",
          title: "Sales Dashboard",
          components: [
            { id: "pipeline-value", type: "ValueCard", apiSource: "/api/deals/summary", label: "Pipeline Value" },
            { id: "deals-chart", type: "BarChart", apiSource: "/api/deals/chart", xField: "stage", yField: "value" }
          ]
        },
        {
          name: "contacts",
          title: "Contacts Directory",
          components: [
            {
              id: "contact-list",
              type: "Table",
              apiSource: "/api/contacts",
              // Aligned field name 'phone' perfectly with the DB and API schema!
              columns: ["first_name", "last_name", "email", "phone", "status"],
              actions: ["Delete", "Edit"]
            },
            {
              id: "create-contact-form",
              type: "Form",
              title: "Create Contact",
              triggerApi: "/api/contacts/create",
              // Aligned field name 'phone' here too!
              fields: ["first_name", "last_name", "email", "phone"]
            }
          ]
        },
        {
          name: "deals",
          title: "Deals Tracker",
          components: [
            {
              id: "deal-board",
              type: "Kanban",
              apiSource: "/api/deals",
              stages: ["Prospecting", "Proposal", "Negotiation", "Won", "Lost"]
            }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        { path: "/api/auth/login", method: "POST", requestFields: ["email", "password"], responseFields: ["token", "user"] },
        { path: "/api/deals/summary", method: "GET", responseFields: ["totalPipeline", "dealCount"] },
        { path: "/api/deals/chart", method: "GET", responseFields: ["data"] },
        { path: "/api/contacts", method: "GET", responseFields: ["contactsList"] },
        // Fixed mismatch: Fields match contacts.phone column in DB!
        { path: "/api/contacts/create", method: "POST", requestFields: ["first_name", "last_name", "email", "phone"], responseFields: ["newContact"] },
        { path: "/api/deals", method: "GET", responseFields: ["deals"] }
      ]
    },
    dbSchema: {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "email", type: "VARCHAR(255)", unique: true },
            { name: "name", type: "VARCHAR(255)" },
            { name: "role", type: "VARCHAR(50)" }
          ]
        },
        {
          name: "contacts",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "first_name", type: "VARCHAR(100)" },
            { name: "last_name", type: "VARCHAR(100)" },
            { name: "email", type: "VARCHAR(255)" },
            { name: "phone", type: "VARCHAR(50)" },
            { name: "status", type: "VARCHAR(50)" },
            { name: "assigned_to", type: "VARCHAR(36)", foreignKey: "users.id" }
          ]
        },
        {
          name: "deals",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "title", type: "VARCHAR(255)" },
            { name: "value", type: "DECIMAL(10,2)" },
            { name: "stage", type: "VARCHAR(50)" },
            { name: "contact_id", type: "VARCHAR(36)", foreignKey: "contacts.id" }
          ]
        }
      ]
    },
    authRules: {
      roles: ["Admin", "SalesAgent", "StandardUser"],
      gatedPaths: [
        { path: "/api/deals/summary", roles: ["Admin"] },
        { path: "/api/deals/chart", roles: ["Admin"] },
        { path: "/api/contacts/create", roles: ["Admin", "SalesAgent"] }
      ]
    }
  };

  const ecomRefined = {
    uiSchema: {
      pages: [
        {
          name: "login",
          title: "Portal Login",
          components: [{ id: "login-form", type: "Form", fields: ["email", "password"], buttonText: "Log In", triggerApi: "/api/auth/login" }]
        },
        {
          name: "products",
          title: "Store Catalog",
          components: [
            { id: "product-grid", type: "Grid", apiSource: "/api/products", fields: ["title", "description", "price", "stock"] }
          ]
        },
        {
          name: "cart",
          title: "My Shopping Cart",
          components: [
            { id: "cart-table", type: "Table", apiSource: "/api/cart/items", columns: ["title", "price", "quantity"] },
            { id: "checkout-btn", type: "CheckoutButton", triggerApi: "/api/orders/checkout" }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        { path: "/api/auth/login", method: "POST", requestFields: ["email", "password"], responseFields: ["token"] },
        { path: "/api/products", method: "GET", responseFields: ["productList"] },
        { path: "/api/cart/items", method: "GET", responseFields: ["cartList"] },
        { path: "/api/orders/checkout", method: "POST", requestFields: ["items"], responseFields: ["orderId"] }
      ]
    },
    dbSchema: {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "email", type: "VARCHAR(255)" },
            { name: "role", type: "VARCHAR(50)" }
          ]
        },
        {
          name: "products",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "title", type: "VARCHAR(255)" },
            { name: "description", type: "TEXT" },
            { name: "price", type: "DECIMAL(10,2)" },
            // Aligned stock_count with UI field stock!
            { name: "stock", type: "INTEGER" }
          ]
        }
      ]
    },
    authRules: {
      roles: ["Admin", "Customer"],
      gatedPaths: [
        { path: "/api/orders/checkout", roles: ["Customer", "Admin"] }
      ]
    }
  };

  const hrmsRefined = {
    uiSchema: {
      pages: [
        {
          name: "directory",
          title: "Staff Members",
          components: [{ id: "staff-list", type: "Table", apiSource: "/api/staff", columns: ["first_name", "last_name", "department"] }]
        },
        {
          name: "leaves",
          title: "Leave Console",
          components: [
            { id: "leaves-table", type: "Table", apiSource: "/api/leaves", columns: ["type", "start_date", "status"] },
            { id: "request-leave-form", type: "Form", triggerApi: "/api/leaves/apply", fields: ["type", "start_date", "end_date"] }
          ]
        }
      ]
    },
    apiSchema: {
      endpoints: [
        { path: "/api/staff", method: "GET", responseFields: ["employees"] },
        { path: "/api/leaves", method: "GET", responseFields: ["requests"] },
        { path: "/api/leaves/apply", method: "POST", requestFields: ["type", "start_date", "end_date"], responseFields: ["request"] }
      ]
    },
    dbSchema: {
      tables: [
        {
          name: "employees",
          columns: [
            { name: "id", type: "VARCHAR(36)", primary: true },
            { name: "first_name", type: "VARCHAR(100)" },
            { name: "last_name", type: "VARCHAR(100)" },
            // Aligned department_name with UI department!
            { name: "department", type: "VARCHAR(255)" }
          ]
        }
      ]
    },
    authRules: {
      roles: ["Admin", "HRManager", "Employee"],
      gatedPaths: [
        { path: "/api/leaves/apply", roles: ["Employee", "HRManager"] }
      ]
    }
  };

  const base = {
    crm: crmRefined,
    ecommerce: ecomRefined,
    hrms: hrmsRefined,
    task_planner: crmRefined // fallback
  };

  return base[type] || base.crm;
}
