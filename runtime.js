/**
 * AI Intern Compiler Executable Sandbox Runtime
 * Implements a complete browser-based in-memory relational database state manager,
 * API Gateway query validator, Auth gate checker, and dynamic page renderer.
 */

class SandboxRuntime {
  constructor(schemas, currentRole = "Admin") {
    this.schemas = schemas;
    this.currentRole = currentRole;
    this.db = {};
    this.authToken = "mock-jwt-token-xyz";
    
    this.initDatabase();
  }

  setRole(role) {
    this.currentRole = role;
  }

  /**
   * Initializes the client-side relational database according to the compiled DB schema
   * and populates it with realistic starter data.
   */
  initDatabase() {
    if (!this.schemas || !this.schemas.dbSchema || !this.schemas.dbSchema.tables) {
      return;
    }

    this.schemas.dbSchema.tables.forEach(table => {
      this.db[table.name] = [];
    });

    // Populate mock starter values based on app tables detected
    if (this.db["users"]) {
      this.db["users"] = [
        { id: "u-1", email: "admin@nomadcrm.com", name: "Siddhant (Admin)", role: "Admin" },
        { id: "u-2", email: "agent@nomadcrm.com", name: "Alex Agent", role: "SalesAgent" },
        { id: "u-3", email: "user@nomadcrm.com", name: "Standard Client", role: "StandardUser" }
      ];
    }

    if (this.db["contacts"]) {
      this.db["contacts"] = [
        { id: "c-1", first_name: "Sarah", last_name: "Connor", email: "sarah@cyberdyne.com", phone: "+1-555-0199", status: "Hot Lead" },
        { id: "c-2", first_name: "John", last_name: "Doe", email: "john.doe@gmail.com", phone: "+1-202-555-0143", status: "Warm Prospect" },
        { id: "c-3", first_name: "Bruce", last_name: "Wayne", email: "bruce@waynecorp.com", phone: "+1-646-555-0190", status: "Customer" }
      ];
    }

    if (this.db["deals"]) {
      this.db["deals"] = [
        { id: "d-1", title: "Cyberdyne Systems Server Setup", value: 45000.00, stage: "Negotiation", contact_id: "c-1" },
        { id: "d-2", title: "Wayne Enterprises R&D Consultation", value: 120000.00, stage: "Proposal", contact_id: "c-3" },
        { id: "d-3", title: "Small Business Starter License", value: 1500.00, stage: "Won", contact_id: "c-2" }
      ];
    }

    if (this.db["products"]) {
      this.db["products"] = [
        { id: "p-1", title: "Nomad Cloud Suite Subscription", price: 99.00, stock: 450 },
        { id: "p-2", title: "Advanced Analytics License Addon", price: 49.00, stock: 200 },
        { id: "p-3", title: "Corporate Enterprise Firewall Router", price: 1200.00, stock: 12 }
      ];
    }

    if (this.db["employees"]) {
      this.db["employees"] = [
        { id: "e-1", first_name: "James", last_name: "Smith", department: "Engineering" },
        { id: "e-2", first_name: "Samantha", last_name: "Reed", department: "HR Talent" },
        { id: "e-3", first_name: "Robert", last_name: "Lee", department: "Product Marketing" }
      ];
    }

    if (this.db["leaves"]) {
      this.db["leaves"] = [
        { id: "l-1", type: "Annual Paid", start_date: "2026-06-01", status: "Approved" },
        { id: "l-2", type: "Sick Emergency Leave", start_date: "2026-05-27", status: "Pending" }
      ];
    }
  }

  /**
   * Simulated API Gateway Router
   * Checks Auth rules, executes CRUD queries on the mock relational DB, and returns HTTP responses.
   * 
   * @param {string} path 
   * @param {string} method 
   * @param {Object} payload 
   * @returns {Promise<Object>} Mock API Response { status, data, error }
   */
  async requestAPI(path, method = "GET", payload = null) {
    await new Promise(r => setTimeout(r, 200)); // Network simulation latency

    // 1. Enforce Auth Gatekeeping Security checks
    const authRule = this.schemas.authRules.gatedPaths?.find(g => g.path === path);
    if (authRule) {
      if (!authRule.roles.includes(this.currentRole)) {
        return {
          status: 403,
          error: "Forbidden",
          message: `Access Denied: Path '${path}' is gated and requires role: [${authRule.roles.join(", ")}]. Current role: '${this.currentRole}'`
        };
      }
    }

    // 2. Query Dispatch routing
    try {
      // --- CRM endpoints ---
      if (path === "/api/contacts" && method === "GET") {
        return { status: 200, data: this.db["contacts"] || [] };
      }

      if (path === "/api/contacts/create" && method === "POST") {
        if (!payload || !payload.first_name || !payload.email) {
          return { status: 400, error: "Bad Request", message: "Missing required fields: first_name, email" };
        }
        const newContact = {
          id: `c-${Date.now()}`,
          first_name: payload.first_name,
          last_name: payload.last_name || "",
          email: payload.email,
          phone: payload.phone || "",
          status: payload.status || "Lead"
        };
        if (!this.db["contacts"]) this.db["contacts"] = [];
        this.db["contacts"].push(newContact);
        return { status: 201, data: newContact };
      }

      if (path === "/api/deals" && method === "GET") {
        return { status: 200, data: this.db["deals"] || [] };
      }

      if (path === "/api/deals/summary" && method === "GET") {
        const list = this.db["deals"] || [];
        const total = list.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
        return { status: 200, data: { totalPipeline: total, dealCount: list.length } };
      }

      if (path === "/api/deals/chart" && method === "GET") {
        const list = this.db["deals"] || [];
        // Group by stage
        const stagesMap = {};
        list.forEach(d => {
          stagesMap[d.stage] = (stagesMap[d.stage] || 0) + parseFloat(d.value || 0);
        });
        const chartData = Object.keys(stagesMap).map(k => ({ stage: k, value: stagesMap[k] }));
        return { status: 200, data: chartData };
      }

      // --- E-Commerce endpoints ---
      if (path === "/api/products" && method === "GET") {
        return { status: 200, data: this.db["products"] || [] };
      }

      // --- HRMS endpoints ---
      if (path === "/api/staff" && method === "GET") {
        return { status: 200, data: this.db["employees"] || [] };
      }

      if (path === "/api/leaves" && method === "GET") {
        return { status: 200, data: this.db["leaves"] || [] };
      }

      if (path === "/api/leaves/apply" && method === "POST") {
        const req = {
          id: `l-${Date.now()}`,
          type: payload.type || "Annual Leave",
          start_date: payload.start_date || "2026-05-25",
          status: "Pending"
        };
        if (!this.db["leaves"]) this.db["leaves"] = [];
        this.db["leaves"].push(req);
        return { status: 201, data: req };
      }

      // General Auth fallback endpoint
      if (path === "/api/auth/login" && method === "POST") {
        return {
          status: 200,
          data: {
            token: this.authToken,
            user: { email: payload.email || "demo@nomad.com", role: this.currentRole }
          }
        };
      }

      return { status: 404, error: "Not Found", message: `REST Route '${path}' not implemented.` };

    } catch (e) {
      return { status: 500, error: "Internal Database Error", message: e.message };
    }
  }
}
