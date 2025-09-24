var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  chatMessages: () => chatMessages,
  comments: () => comments,
  faqs: () => faqs,
  insertCategorySchema: () => insertCategorySchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertCommentSchema: () => insertCommentSchema,
  insertFaqSchema: () => insertFaqSchema,
  insertJourneyCommentSchema: () => insertJourneyCommentSchema,
  insertJourneyExportSchema: () => insertJourneyExportSchema,
  insertJourneyStepSchema: () => insertJourneyStepSchema,
  insertJourneyTemplateSchema: () => insertJourneyTemplateSchema,
  insertTicketSchema: () => insertTicketSchema,
  insertUserJourneySchema: () => insertUserJourneySchema,
  insertUserSchema: () => insertUserSchema,
  journeyComments: () => journeyComments,
  journeyExports: () => journeyExports,
  journeySteps: () => journeySteps,
  journeyTemplates: () => journeyTemplates,
  tickets: () => tickets,
  userJourneys: () => userJourneys,
  users: () => users
});
import { mysqlTable, text, int, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
var users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  // "admin", "agent", "user"
  companyName: text("company_name"),
  department: text("department"),
  contactNumber: text("contact_number"),
  designation: text("designation"),
  createdAt: timestamp("created_at").defaultNow()
});
var categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  parentId: int("parent_id")
});
var tickets = mysqlTable("tickets", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  // "open", "in-progress", "resolved", "closed"
  priority: text("priority").notNull().default("medium"),
  // "low", "medium", "high"
  supportType: text("support_type").notNull().default("remote"),
  // "remote", "telephonic", "onsite_visit", "other"
  contactEmail: text("contact_email"),
  // Email for contact field
  contactName: text("contact_name"),
  // Name associated with contact email
  contactPhone: text("contact_phone"),
  // Phone number for contact
  contactDepartment: text("contact_department"),
  // Department for contact
  categoryId: int("category_id").references(() => categories.id).notNull(),
  subcategoryId: int("subcategory_id").references(() => categories.id),
  createdById: int("created_by_id").references(() => users.id).notNull(),
  assignedToId: int("assigned_to_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  // Adding due date for reports filtering
  attachmentUrl: text("attachment_url"),
  // File attachment URL
  attachmentName: text("attachment_name"),
  // Original file name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var comments = mysqlTable("comments", {
  id: int("id").primaryKey().autoincrement(),
  ticketId: int("ticket_id").references(() => tickets.id).notNull(),
  userId: int("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var faqs = mysqlTable("faqs", {
  id: int("id").primaryKey().autoincrement(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  categoryId: int("category_id").references(() => categories.id),
  viewCount: int("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var chatMessages = mysqlTable("chat_messages", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isFromBot: boolean("is_from_bot").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var journeyTemplates = mysqlTable("journey_templates", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  // "onboarding", "feature-workflow", "error-recovery", "admin", "returning-user"
  color: text("color").default("#3B82F6"),
  // Color for visual identification
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userJourneys = mysqlTable("user_journeys", {
  id: int("id").primaryKey().autoincrement(),
  templateId: int("template_id").references(() => journeyTemplates.id),
  title: text("title").notNull(),
  description: text("description"),
  version: text("version").default("1.0"),
  status: text("status").notNull().default("draft"),
  // "draft", "in-review", "approved", "archived"
  personas: json("personas").$type().default([]),
  // Array of user persona names
  prerequisites: text("prerequisites"),
  entryPoints: json("entry_points").$type().default([]),
  // Where users can start this journey
  successCriteria: text("success_criteria"),
  painPoints: text("pain_points"),
  improvementNotes: text("improvement_notes"),
  createdById: int("created_by_id").references(() => users.id).notNull(),
  lastUpdatedById: int("last_updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journeySteps = mysqlTable("journey_steps", {
  id: int("id").primaryKey().autoincrement(),
  journeyId: int("journey_id").references(() => userJourneys.id).notNull(),
  stepNumber: int("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  userActions: json("user_actions").$type().default([]),
  // Array of required user actions
  systemResponses: json("system_responses").$type().default([]),
  // Array of system responses
  expectedOutcomes: json("expected_outcomes").$type().default([]),
  // Array of expected outcomes
  errorScenarios: json("error_scenarios").$type().default([]),
  // Error handling
  screenshotPlaceholder: text("screenshot_placeholder"),
  // Placeholder for screenshot/mockup
  notes: text("notes"),
  isOptional: boolean("is_optional").default(false),
  estimatedDuration: text("estimated_duration"),
  // e.g., "2 minutes", "30 seconds"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journeyComments = mysqlTable("journey_comments", {
  id: int("id").primaryKey().autoincrement(),
  journeyId: int("journey_id").references(() => userJourneys.id),
  stepId: int("step_id").references(() => journeySteps.id),
  // Optional: comment on specific step
  userId: int("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  type: text("type").default("comment"),
  // "comment", "suggestion", "issue"
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var journeyExports = mysqlTable("journey_exports", {
  id: int("id").primaryKey().autoincrement(),
  journeyId: int("journey_id").references(() => userJourneys.id).notNull(),
  exportType: text("export_type").notNull(),
  // "pdf", "markdown", "share-link"
  exportData: json("export_data").$type().default({}),
  // Metadata about the export
  shareToken: text("share_token"),
  // For shareable links
  expiresAt: timestamp("expires_at"),
  // For shareable links
  createdById: int("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});
var insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var insertJourneyTemplateSchema = createInsertSchema(journeyTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserJourneySchema = createInsertSchema(userJourneys).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJourneyStepSchema = createInsertSchema(journeySteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJourneyCommentSchema = createInsertSchema(journeyComments).omit({
  id: true,
  createdAt: true
});
var insertJourneyExportSchema = createInsertSchema(journeyExports).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
import session from "express-session";

// server/db.ts
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
dotenv.config();
var mysqlConfig = {
  host: "82.25.105.94",
  database: "cybaemtechnet_itsm_helpdesk",
  user: "cybaemtechnet_itsm_helpdesk",
  password: "Cybaem@2025",
  charset: "utf8mb4",
  connectionLimit: 10,
  acquireTimeout: 6e4,
  timeout: 6e4
};
console.log("\u{1F517} Connecting to MySQL cPanel database...");
var connection = mysql.createPool(mysqlConfig);
var db = drizzle(connection, { schema: schema_exports, mode: "default" });

// server/storage.ts
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
var PostgresSessionStore = connectPg(session);
var MemoryStore = createMemoryStore(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
  }
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserById(id) {
    return this.getUser(id);
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByUsernameOrEmail(username, email) {
    const [user] = await db.select().from(users).where(
      sql`${users.username} = ${username} OR ${users.email} = ${email}`
    );
    return user;
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser);
    const insertId = result[0].insertId;
    const user = await this.getUser(Number(insertId));
    if (!user) throw new Error("Failed to create user");
    return user;
  }
  async updateUser(id, data) {
    await db.update(users).set(data).where(eq(users.id, id));
    return await this.getUser(id);
  }
  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  // Category operations
  async getCategory(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  async getCategoryByName(name) {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }
  async createCategory(insertCategory) {
    const result = await db.insert(categories).values(insertCategory);
    const insertId = result[0].insertId;
    const category = await this.getCategory(Number(insertId));
    if (!category) throw new Error("Failed to create category");
    return category;
  }
  async getAllCategories() {
    return await db.select().from(categories);
  }
  async getSubcategories(parentId) {
    return await db.select().from(categories).where(eq(categories.parentId, parentId));
  }
  async updateCategory(id, data) {
    await db.update(categories).set(data).where(eq(categories.id, id));
    return await this.getCategory(id);
  }
  async deleteCategory(id) {
    const category = await this.getCategory(id);
    if (!category) {
      throw new Error("Category not found");
    }
    const subcategories = await this.getSubcategories(id);
    if (subcategories.length > 0) {
      throw new Error("Cannot delete category with subcategories. Please delete subcategories first.");
    }
    const ticketsUsingCategory = await db.select().from(tickets).where(sql`${tickets.categoryId} = ${id} OR ${tickets.subcategoryId} = ${id}`);
    if (ticketsUsingCategory.length > 0) {
      throw new Error(`Cannot delete category. It is being used by ${ticketsUsingCategory.length} ticket(s).`);
    }
    await db.delete(categories).where(eq(categories.id, id));
  }
  // Ticket operations
  async getTicket(id) {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }
  async getTicketWithRelations(id) {
    const ticket = await this.getTicket(id);
    if (!ticket) return void 0;
    const category = await this.getCategory(ticket.categoryId);
    if (!category) return void 0;
    let subcategory = void 0;
    if (ticket.subcategoryId) {
      subcategory = await this.getCategory(ticket.subcategoryId);
    }
    const createdBy = await this.getUser(ticket.createdById);
    if (!createdBy) return void 0;
    let assignedTo = void 0;
    if (ticket.assignedToId) {
      assignedTo = await this.getUser(ticket.assignedToId);
    }
    const ticketComments = await this.getTicketComments(ticket.id);
    return {
      ...ticket,
      category,
      subcategory,
      createdBy,
      assignedTo,
      comments: ticketComments
    };
  }
  async createTicket(insertTicket) {
    try {
      const result = await db.insert(tickets).values({
        title: insertTicket.title,
        description: insertTicket.description,
        status: insertTicket.status || "open",
        priority: insertTicket.priority || "medium",
        supportType: insertTicket.supportType || "remote",
        contactEmail: insertTicket.contactEmail || null,
        contactName: insertTicket.contactName || null,
        contactPhone: insertTicket.contactPhone || null,
        contactDepartment: insertTicket.contactDepartment || null,
        categoryId: insertTicket.categoryId,
        subcategoryId: insertTicket.subcategoryId || null,
        assignedToId: insertTicket.assignedToId || null,
        createdById: insertTicket.createdById,
        dueDate: insertTicket.dueDate || null,
        attachmentUrl: insertTicket.attachmentUrl || null,
        attachmentName: insertTicket.attachmentName || null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      const insertId = result[0].insertId;
      const ticket = await this.getTicket(Number(insertId));
      if (!ticket) throw new Error("Failed to create ticket");
      return ticket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  }
  async updateTicket(id, data) {
    await db.update(tickets).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(tickets.id, id));
    return await this.getTicket(id);
  }
  async deleteTicket(id) {
    await db.delete(tickets).where(eq(tickets.id, id));
  }
  async getUserTickets(userId) {
    return await db.select().from(tickets).where(eq(tickets.createdById, userId));
  }
  async getAssignedTickets(userId) {
    try {
      const assignedTickets = await db.select().from(tickets).where(eq(tickets.assignedToId, userId));
      const ticketsWithRelations = [];
      for (const ticket of assignedTickets) {
        const category = await this.getCategory(ticket.categoryId);
        let subcategory = null;
        if (ticket.subcategoryId) {
          subcategory = await this.getCategory(ticket.subcategoryId);
        }
        const createdBy = await this.getUser(ticket.createdById);
        const assignedTo = await this.getUser(ticket.assignedToId);
        const ticketComments = await this.getTicketComments(ticket.id);
        ticketsWithRelations.push({
          ...ticket,
          category: category || null,
          subcategory,
          createdBy: createdBy || null,
          assignedTo,
          comments: ticketComments
        });
      }
      return ticketsWithRelations;
    } catch (error) {
      console.error("Error getting assigned tickets:", error);
      throw error;
    }
  }
  async getAllTickets() {
    try {
      return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }
  async getAllTicketsWithRelations() {
    try {
      const allTickets = await this.getAllTickets();
      const ticketsWithRelations = [];
      for (const ticket of allTickets) {
        const category = await this.getCategory(ticket.categoryId);
        let subcategory = null;
        if (ticket.subcategoryId) {
          subcategory = await this.getCategory(ticket.subcategoryId);
        }
        const createdBy = await this.getUser(ticket.createdById);
        let assignedTo = null;
        if (ticket.assignedToId) {
          assignedTo = await this.getUser(ticket.assignedToId);
        }
        const ticketComments = await this.getTicketComments(ticket.id);
        const commentCount = ticketComments.length;
        ticketsWithRelations.push({
          ...ticket,
          category: category || null,
          subcategory,
          createdBy: createdBy || null,
          assignedTo,
          commentCount
        });
      }
      return ticketsWithRelations;
    } catch (error) {
      console.error("Error in getAllTicketsWithRelations:", error);
      throw error;
    }
  }
  async getFilteredTickets(filters) {
    let query = db.select().from(tickets);
    if (filters.status) {
      query = query.where(eq(tickets.status, filters.status));
    }
    if (filters.priority) {
      query = query.where(eq(tickets.priority, filters.priority));
    }
    if (filters.categoryId) {
      query = query.where(
        sql`${tickets.categoryId} = ${filters.categoryId} OR 
            ${tickets.subcategoryId} = ${filters.categoryId}`
      );
    }
    return await query;
  }
  async getTicketsCount() {
    const allTickets = await this.getAllTickets();
    return {
      total: allTickets.length,
      open: allTickets.filter((t) => t.status === "open").length,
      inProgress: allTickets.filter((t) => t.status === "in-progress").length,
      resolved: allTickets.filter((t) => t.status === "resolved").length,
      closed: allTickets.filter((t) => t.status === "closed").length
    };
  }
  async getDashboardStats() {
    const counts = await this.getTicketsCount();
    return {
      openTickets: counts.open,
      inProgressTickets: counts.inProgress,
      resolvedTickets: counts.resolved,
      closedTickets: counts.closed,
      avgResponseTime: "4.2 hours",
      // This could be calculated from actual data
      slaComplianceRate: "94%"
      // This could be calculated from actual data
    };
  }
  // New role-based methods
  async getTicketsByAgent(agentId) {
    try {
      const agentTickets = await db.select().from(tickets).where(sql`${tickets.assignedToId} = ${agentId} OR ${tickets.createdById} = ${agentId}`);
      const ticketsWithRelations = [];
      for (const ticket of agentTickets) {
        const ticketWithRelations = await this.getTicketWithRelations(ticket.id);
        if (ticketWithRelations) {
          ticketsWithRelations.push(ticketWithRelations);
        }
      }
      return ticketsWithRelations;
    } catch (error) {
      console.error("Error getting agent tickets:", error);
      throw error;
    }
  }
  async getTicketsByUser(userId) {
    try {
      const userTickets = await db.select().from(tickets).where(eq(tickets.createdById, userId));
      const ticketsWithRelations = [];
      for (const ticket of userTickets) {
        const ticketWithRelations = await this.getTicketWithRelations(ticket.id);
        if (ticketWithRelations) {
          ticketsWithRelations.push(ticketWithRelations);
        }
      }
      return ticketsWithRelations;
    } catch (error) {
      console.error("Error getting user tickets:", error);
      throw error;
    }
  }
  async getFilteredTicketsForAgent(agentId, filters) {
    try {
      const conditions = [sql`${tickets.assignedToId} = ${agentId} OR ${tickets.createdById} = ${agentId}`];
      if (filters.status) {
        conditions.push(eq(tickets.status, filters.status));
      }
      if (filters.priority) {
        conditions.push(eq(tickets.priority, filters.priority));
      }
      if (filters.categoryId) {
        conditions.push(
          sql`${tickets.categoryId} = ${filters.categoryId} OR ${tickets.subcategoryId} = ${filters.categoryId}`
        );
      }
      const query = db.select().from(tickets).where(and(...conditions));
      const filteredTickets = await query;
      const ticketsWithRelations = [];
      for (const ticket of filteredTickets) {
        const ticketWithRelations = await this.getTicketWithRelations(ticket.id);
        if (ticketWithRelations) {
          ticketsWithRelations.push(ticketWithRelations);
        }
      }
      return ticketsWithRelations;
    } catch (error) {
      console.error("Error getting filtered agent tickets:", error);
      throw error;
    }
  }
  async getFilteredTicketsForUser(userId, filters) {
    try {
      const conditions = [eq(tickets.createdById, userId)];
      if (filters.status) {
        conditions.push(eq(tickets.status, filters.status));
      }
      if (filters.priority) {
        conditions.push(eq(tickets.priority, filters.priority));
      }
      if (filters.categoryId) {
        conditions.push(
          sql`${tickets.categoryId} = ${filters.categoryId} OR ${tickets.subcategoryId} = ${filters.categoryId}`
        );
      }
      const query = db.select().from(tickets).where(and(...conditions));
      const filteredTickets = await query;
      const ticketsWithRelations = [];
      for (const ticket of filteredTickets) {
        const ticketWithRelations = await this.getTicketWithRelations(ticket.id);
        if (ticketWithRelations) {
          ticketsWithRelations.push(ticketWithRelations);
        }
      }
      return ticketsWithRelations;
    } catch (error) {
      console.error("Error getting filtered user tickets:", error);
      throw error;
    }
  }
  async getDashboardStatsForAgent(agentId) {
    try {
      const agentTickets = await this.getTicketsByAgent(agentId);
      const counts = {
        open: agentTickets.filter((t) => t.status === "open").length,
        inProgress: agentTickets.filter((t) => t.status === "in-progress").length,
        resolved: agentTickets.filter((t) => t.status === "resolved").length,
        closed: agentTickets.filter((t) => t.status === "closed").length
      };
      return {
        openTickets: counts.open,
        inProgressTickets: counts.inProgress,
        resolvedTickets: counts.resolved,
        closedTickets: counts.closed,
        avgResponseTime: "1.8 hours",
        slaComplianceRate: "96%"
      };
    } catch (error) {
      console.error("Error getting agent dashboard stats:", error);
      throw error;
    }
  }
  async getDashboardStatsForUser(userId) {
    try {
      const userTickets = await this.getTicketsByUser(userId);
      const counts = {
        open: userTickets.filter((t) => t.status === "open").length,
        inProgress: userTickets.filter((t) => t.status === "in-progress").length,
        resolved: userTickets.filter((t) => t.status === "resolved").length,
        closed: userTickets.filter((t) => t.status === "closed").length
      };
      return {
        openTickets: counts.open,
        inProgressTickets: counts.inProgress,
        resolvedTickets: counts.resolved,
        closedTickets: counts.closed,
        avgResponseTime: "N/A",
        slaComplianceRate: "N/A"
      };
    } catch (error) {
      console.error("Error getting user dashboard stats:", error);
      throw error;
    }
  }
  async getUsersByRoles(roles) {
    try {
      return await db.select().from(users).where(inArray(users.role, roles));
    } catch (error) {
      console.error("Error getting users by roles:", error);
      throw error;
    }
  }
  // Comment operations
  async getComment(id) {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }
  async getTicketComments(ticketId) {
    const commentsResult = await db.select().from(comments).where(eq(comments.ticketId, ticketId));
    const commentsWithUser = [];
    for (const comment of commentsResult) {
      const user = await this.getUser(comment.userId);
      if (user) {
        commentsWithUser.push({ ...comment, user });
      }
    }
    return commentsWithUser;
  }
  async createComment(insertComment) {
    const result = await db.insert(comments).values({
      ...insertComment,
      createdAt: /* @__PURE__ */ new Date()
    });
    const insertId = result[0].insertId;
    const comment = await this.getComment(Number(insertId));
    if (!comment) throw new Error("Failed to create comment");
    return comment;
  }
  // FAQ operations
  async getFaq(id) {
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
    return faq;
  }
  async getAllFaqs() {
    return await db.select().from(faqs);
  }
  async getFaqsByCategory(categoryId) {
    return await db.select().from(faqs).where(eq(faqs.categoryId, categoryId));
  }
  async createFaq(insertFaq) {
    const result = await db.insert(faqs).values({
      ...insertFaq,
      viewCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const insertId = result[0].insertId;
    const faq = await this.getFaq(Number(insertId));
    if (!faq) throw new Error("Failed to create FAQ");
    return faq;
  }
  async updateFaq(id, data) {
    await db.update(faqs).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(faqs.id, id));
    return await this.getFaq(id);
  }
  // Chat operations
  async getChatMessages(userId) {
    return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
  }
  async createChatMessage(insertMessage) {
    const result = await db.insert(chatMessages).values({
      ...insertMessage,
      createdAt: /* @__PURE__ */ new Date()
    });
    const insertId = result[0].insertId;
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, Number(insertId)));
    if (!message) throw new Error("Failed to create chat message");
    return message;
  }
  // Helper method to build filter conditions for tickets
  buildTicketFilters(filters) {
    const conditions = [];
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      conditions.push(
        or(
          sql`LOWER(${tickets.title}) LIKE ${`%${searchTerm}%`}`,
          sql`LOWER(${tickets.description}) LIKE ${`%${searchTerm}%`}`,
          sql`CONCAT('TKT-', LPAD(${tickets.id}, 4, '0')) LIKE ${`%${searchTerm}%`}`
        )
      );
    }
    if (filters.status) {
      conditions.push(eq(tickets.status, filters.status));
    }
    if (filters.priority) {
      conditions.push(eq(tickets.priority, filters.priority));
    }
    if (filters.categoryId) {
      conditions.push(
        or(
          eq(tickets.categoryId, filters.categoryId),
          eq(tickets.subcategoryId, filters.categoryId)
        )
      );
    }
    if (filters.assignedToId !== void 0) {
      if (filters.assignedToId === null) {
        conditions.push(sql`${tickets.assignedToId} IS NULL`);
      } else {
        conditions.push(eq(tickets.assignedToId, filters.assignedToId));
      }
    }
    return conditions;
  }
  // Helper method to build role-based conditions
  buildRoleConditions(role, userId) {
    const conditions = [];
    if (role === "admin") {
    } else if (role === "agent") {
      conditions.push(
        or(
          eq(tickets.assignedToId, userId),
          eq(tickets.createdById, userId)
        )
      );
    } else {
      conditions.push(eq(tickets.createdById, userId));
    }
    return conditions;
  }
  async getAllTicketsWithPagination(filters, page, limit) {
    const filterConditions = this.buildTicketFilters(filters);
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : void 0;
    const totalCountResult = await db.select({ count: sql`count(*)` }).from(tickets).where(whereClause);
    const totalCount = totalCountResult[0]?.count || 0;
    const statusCountsResult = await db.select({
      status: tickets.status,
      count: sql`count(*)`
    }).from(tickets).where(whereClause).groupBy(tickets.status);
    const statusCounts = {
      open: 0,
      inProgress: 0,
      closed: 0
    };
    statusCountsResult.forEach((row) => {
      if (row.status === "open") statusCounts.open = row.count;
      else if (row.status === "in-progress") statusCounts.inProgress = row.count;
      else if (row.status === "closed") statusCounts.closed = row.count;
    });
    const offset = (page - 1) * limit;
    const ticketResults = await db.select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      supportType: tickets.supportType,
      attachmentUrl: tickets.attachmentUrl,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      categoryId: tickets.categoryId,
      subcategoryId: tickets.subcategoryId,
      createdById: tickets.createdById,
      assignedToId: tickets.assignedToId,
      category: {
        id: categories.id,
        name: categories.name,
        parentId: categories.parentId
      },
      subcategory: {
        id: sql`sub_cat.id`,
        name: sql`sub_cat.name`,
        parentId: sql`sub_cat.parent_id`
      },
      createdBy: {
        id: sql`created_by.id`,
        username: sql`created_by.username`,
        email: sql`created_by.email`,
        role: sql`created_by.role`
      },
      assignedTo: {
        id: sql`assigned_to.id`,
        username: sql`assigned_to.username`,
        email: sql`assigned_to.email`,
        role: sql`assigned_to.role`
      }
    }).from(tickets).leftJoin(categories, eq(tickets.categoryId, categories.id)).leftJoin(sql`categories AS sub_cat`, sql`${tickets.subcategoryId} = sub_cat.id`).leftJoin(sql`users AS created_by`, sql`${tickets.createdById} = created_by.id`).leftJoin(sql`users AS assigned_to`, sql`${tickets.assignedToId} = assigned_to.id`).where(whereClause).orderBy(desc(tickets.createdAt)).limit(limit).offset(offset);
    return {
      tickets: ticketResults,
      totalCount,
      statusCounts
    };
  }
  async getTicketsWithPaginationForRole(role, userId, filters, page, limit) {
    const filterConditions = this.buildTicketFilters(filters);
    const roleConditions = this.buildRoleConditions(role, userId);
    const allConditions = [...filterConditions, ...roleConditions];
    const whereClause = allConditions.length > 0 ? and(...allConditions) : void 0;
    const totalCountResult = await db.select({ count: sql`count(*)` }).from(tickets).where(whereClause);
    const totalCount = totalCountResult[0]?.count || 0;
    const statusCountsResult = await db.select({
      status: tickets.status,
      count: sql`count(*)`
    }).from(tickets).where(whereClause).groupBy(tickets.status);
    const statusCounts = {
      open: 0,
      inProgress: 0,
      closed: 0
    };
    statusCountsResult.forEach((row) => {
      if (row.status === "open") statusCounts.open = row.count;
      else if (row.status === "in-progress") statusCounts.inProgress = row.count;
      else if (row.status === "closed") statusCounts.closed = row.count;
    });
    const offset = (page - 1) * limit;
    const ticketResults = await db.select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      supportType: tickets.supportType,
      attachmentUrl: tickets.attachmentUrl,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      categoryId: tickets.categoryId,
      subcategoryId: tickets.subcategoryId,
      createdById: tickets.createdById,
      assignedToId: tickets.assignedToId,
      category: {
        id: categories.id,
        name: categories.name,
        parentId: categories.parentId
      },
      subcategory: {
        id: sql`sub_cat.id`,
        name: sql`sub_cat.name`,
        parentId: sql`sub_cat.parent_id`
      },
      createdBy: {
        id: sql`created_by.id`,
        username: sql`created_by.username`,
        email: sql`created_by.email`,
        role: sql`created_by.role`
      },
      assignedTo: {
        id: sql`assigned_to.id`,
        username: sql`assigned_to.username`,
        email: sql`assigned_to.email`,
        role: sql`assigned_to.role`
      }
    }).from(tickets).leftJoin(categories, eq(tickets.categoryId, categories.id)).leftJoin(sql`categories AS sub_cat`, sql`${tickets.subcategoryId} = sub_cat.id`).leftJoin(sql`users AS created_by`, sql`${tickets.createdById} = created_by.id`).leftJoin(sql`users AS assigned_to`, sql`${tickets.assignedToId} = assigned_to.id`).where(whereClause).orderBy(desc(tickets.createdAt)).limit(limit).offset(offset);
    return {
      tickets: ticketResults,
      totalCount,
      statusCounts
    };
  }
  async getFilteredTicketsForRole(role, userId, filters) {
    const filterConditions = this.buildTicketFilters(filters);
    const roleConditions = this.buildRoleConditions(role, userId);
    const allConditions = [...filterConditions, ...roleConditions];
    const whereClause = allConditions.length > 0 ? and(...allConditions) : void 0;
    const ticketResults = await db.select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      supportType: tickets.supportType,
      attachmentUrl: tickets.attachmentUrl,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      categoryId: tickets.categoryId,
      subcategoryId: tickets.subcategoryId,
      createdById: tickets.createdById,
      assignedToId: tickets.assignedToId,
      category: {
        id: categories.id,
        name: categories.name,
        parentId: categories.parentId
      },
      subcategory: {
        id: sql`sub_cat.id`,
        name: sql`sub_cat.name`,
        parentId: sql`sub_cat.parent_id`
      },
      createdBy: {
        id: sql`created_by.id`,
        username: sql`created_by.username`,
        email: sql`created_by.email`,
        role: sql`created_by.role`
      },
      assignedTo: {
        id: sql`assigned_to.id`,
        username: sql`assigned_to.username`,
        email: sql`assigned_to.email`,
        role: sql`assigned_to.role`
      }
    }).from(tickets).leftJoin(categories, eq(tickets.categoryId, categories.id)).leftJoin(sql`categories AS sub_cat`, sql`${tickets.subcategoryId} = sub_cat.id`).leftJoin(sql`users AS created_by`, sql`${tickets.createdById} = created_by.id`).leftJoin(sql`users AS assigned_to`, sql`${tickets.assignedToId} = assigned_to.id`).where(whereClause).orderBy(desc(tickets.createdAt));
    return ticketResults;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import bcrypt from "bcrypt";
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
async function comparePasswords(supplied, stored) {
  try {
    return await bcrypt.compare(supplied, stored);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}
async function setupAuth(app2) {
  const demoUsers = [
    {
      username: "admin",
      password: await hashPassword("admin123"),
      name: "Admin User",
      email: "admin@example.com",
      role: "admin"
    },
    {
      username: "agent",
      password: await hashPassword("agent123"),
      name: "Support Agent",
      email: "agent@example.com",
      role: "agent"
    },
    {
      username: "user",
      password: await hashPassword("user123"),
      name: "John Smith",
      email: "user@example.com",
      role: "user"
    }
  ];
  for (const demo of demoUsers) {
    const existing = await storage.getUserByUsername(demo.username);
    if (!existing) {
      await storage.createUser(demo);
    } else {
      await storage.updateUser(existing.id, { password: demo.password });
    }
  }
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "helpdesk-portal-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, email } = req.body;
      const role = "user";
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        email,
        role
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
import bcrypt2 from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import * as createCsvWriter from "csv-writer";
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
var isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Admin access required" });
};
var isSupportStaff = (req, res, next) => {
  if (req.isAuthenticated() && (req.user?.role === "admin" || req.user?.role === "agent")) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Support staff access required" });
};
var requireRole = (roles) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
  };
};
async function registerRoutes(app2) {
  await setupAuth(app2);
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({
    storage: storage_multer,
    limits: { fileSize: 10 * 1024 * 1024 },
    // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|csv/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === "text/csv" || file.mimetype === "application/csv";
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Only images, PDFs, documents, and CSV files are allowed"));
      }
    }
  });
  app2.use("/uploads", express.static(uploadsDir));
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getAllCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const subcategories = await storage.getSubcategories(parentId);
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });
  app2.post("/api/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });
  app2.put("/api/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });
  app2.delete("/api/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/tickets", isAuthenticated, async (req, res) => {
    try {
      console.log("=== TICKETS API CALLED ===");
      console.log("User:", req.user);
      console.log("Query params:", req.query);
      const page = req.query.page ? parseInt(req.query.page) : void 0;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const search = req.query.search;
      const status = req.query.status;
      const priority = req.query.priority;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : void 0;
      const assignedToId = req.query.assignedToId ? parseInt(req.query.assignedToId) : void 0;
      const isPaginationRequested = page !== void 0 && limit !== void 0;
      const filters = {
        search,
        status,
        priority,
        categoryId,
        assignedToId: assignedToId === 0 ? null : assignedToId
        // 0 means unassigned
      };
      Object.keys(filters).forEach((key) => {
        if (filters[key] === void 0) {
          delete filters[key];
        }
      });
      if (req.user?.role !== "admin" && "assignedToId" in filters) {
        delete filters.assignedToId;
      }
      let tickets2;
      let totalCount = 0;
      let statusCounts = { open: 0, inProgress: 0, closed: 0 };
      if (req.user?.role === "admin") {
        if (isPaginationRequested) {
          const result = await storage.getAllTicketsWithPagination(filters, page, limit);
          tickets2 = result.tickets;
          totalCount = result.totalCount;
          statusCounts = result.statusCounts;
        } else {
          tickets2 = await storage.getFilteredTicketsForRole("admin", req.user.id, filters);
        }
      } else if (req.user?.role === "agent") {
        if (isPaginationRequested) {
          const result = await storage.getTicketsWithPaginationForRole("agent", req.user.id, filters, page, limit);
          tickets2 = result.tickets;
          totalCount = result.totalCount;
          statusCounts = result.statusCounts;
        } else {
          tickets2 = await storage.getFilteredTicketsForRole("agent", req.user.id, filters);
        }
      } else {
        if (isPaginationRequested) {
          const result = await storage.getTicketsWithPaginationForRole("user", req.user.id, filters, page, limit);
          tickets2 = result.tickets;
          totalCount = result.totalCount;
          statusCounts = result.statusCounts;
        } else {
          tickets2 = await storage.getFilteredTicketsForRole("user", req.user.id, filters);
        }
      }
      if (isPaginationRequested) {
        res.json({
          tickets: tickets2,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            limit,
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPreviousPage: page > 1
          },
          statusCounts
        });
      } else {
        res.json(tickets2);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });
  app2.get("/api/tickets/my", isAuthenticated, async (req, res) => {
    try {
      const tickets2 = await storage.getUserTickets(req.user.id);
      res.json(tickets2);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch user tickets" });
    }
  });
  app2.get("/api/tickets/filter", isAuthenticated, async (req, res) => {
    try {
      const { status, priority, categoryId } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (categoryId) filters.categoryId = parseInt(categoryId);
      let tickets2;
      if (req.user?.role === "admin") {
        tickets2 = await storage.getFilteredTickets(filters);
      } else if (req.user?.role === "agent") {
        tickets2 = await storage.getFilteredTicketsForAgent(req.user.id, filters);
      } else {
        tickets2 = await storage.getFilteredTicketsForUser(req.user.id, filters);
      }
      res.json(tickets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter tickets" });
    }
  });
  app2.get("/api/tickets/export", isAuthenticated, async (req, res) => {
    try {
      console.log("Export request from user:", req.user?.role, req.user?.id);
      let tickets2;
      if (req.user?.role === "admin") {
        console.log("Fetching all tickets with relations...");
        tickets2 = await storage.getAllTicketsWithRelations();
      } else if (req.user?.role === "agent") {
        console.log("Fetching assigned tickets...");
        tickets2 = await storage.getAssignedTickets(req.user.id);
      } else {
        console.log("Fetching user tickets...");
        tickets2 = await storage.getTicketsByUser(req.user.id);
      }
      console.log("Fetched tickets count:", tickets2.length);
      const csvData = tickets2.map((ticket) => {
        const createdDate = new Date(ticket.createdAt);
        const updatedDate = new Date(ticket.updatedAt);
        const currentDate = /* @__PURE__ */ new Date();
        const daysOpen = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1e3 * 60 * 60 * 24));
        let resolutionTime = "";
        if (ticket.status === "resolved" || ticket.status === "closed") {
          const resolutionTimeMs = updatedDate.getTime() - createdDate.getTime();
          const resolutionDays = Math.floor(resolutionTimeMs / (1e3 * 60 * 60 * 24));
          resolutionTime = resolutionDays.toString();
        } else {
          resolutionTime = (-daysOpen).toString();
        }
        return {
          "Ticket ID": ticket.id,
          "Title": ticket.title,
          "Description": ticket.description,
          "Status": ticket.status,
          "Priority": ticket.priority,
          "Support Type": ticket.supportType,
          "Category": ticket.category?.name || "",
          "Created By Name": ticket.createdBy?.name || "",
          "Created By Email": ticket.createdBy?.email || "",
          "Created By Department": ticket.createdBy?.department || "",
          "Assigned To Name": ticket.assignedTo?.name || "",
          "Assigned To Email": ticket.assignedTo?.email || "",
          "Contact Email": ticket.contactEmail || "",
          "Contact Name": ticket.contactName || "",
          "Contact Phone": ticket.contactPhone || "",
          "Contact Department": ticket.contactDepartment || "",
          "Created Date": createdDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
          "Updated Date": updatedDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
          "Due Date": ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "",
          "Days Open": daysOpen,
          "Resolution Time": resolutionTime
        };
      });
      const csvFilePath = path.join(process.cwd(), "uploads", `tickets_export_${Date.now()}.csv`);
      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: "Ticket ID", title: "Ticket ID" },
          { id: "Title", title: "Title" },
          { id: "Description", title: "Description" },
          { id: "Status", title: "Status" },
          { id: "Priority", title: "Priority" },
          { id: "Support Type", title: "Support Type" },
          { id: "Category", title: "Category" },
          { id: "Created By Name", title: "Created By Name" },
          { id: "Created By Email", title: "Created By Email" },
          { id: "Created By Department", title: "Created By Department" },
          { id: "Assigned To Name", title: "Assigned To Name" },
          { id: "Assigned To Email", title: "Assigned To Email" },
          { id: "Contact Email", title: "Contact Email" },
          { id: "Contact Name", title: "Contact Name" },
          { id: "Contact Phone", title: "Contact Phone" },
          { id: "Contact Department", title: "Contact Department" },
          { id: "Created Date", title: "Created Date" },
          { id: "Updated Date", title: "Updated Date" },
          { id: "Due Date", title: "Due Date" },
          { id: "Days Open", title: "Days Open" },
          { id: "Resolution Time", title: "Resolution Time" }
        ]
      });
      await csvWriter.writeRecords(csvData);
      const filename = path.basename(csvFilePath);
      res.download(csvFilePath, filename, (err) => {
        if (err) {
          console.error("Download error:", err);
        } else {
          setTimeout(() => {
            try {
              fs.unlinkSync(csvFilePath);
            } catch (deleteErr) {
              console.error("Failed to delete temp file:", deleteErr);
            }
          }, 1e4);
        }
      });
    } catch (error) {
      console.error("CSV export error:", error);
      res.status(500).json({ message: "Failed to export tickets" });
    }
  });
  app2.get("/api/tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicketWithRelations(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      if (req.user?.role === "user" && ticket.createdById !== req.user.id) {
        return res.status(403).json({ message: "Access denied: You can only view your own tickets" });
      }
      if (req.user?.role === "agent" && ticket.assignedToId !== req.user.id && ticket.createdById !== req.user.id) {
        return res.status(403).json({ message: "Access denied: You can only view tickets assigned to you or created by you" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });
  app2.post("/api/tickets", isAuthenticated, upload.single("attachment"), async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }
      const processedData = {
        ...req.body,
        categoryId: parseInt(req.body.categoryId),
        subcategoryId: req.body.subcategoryId ? parseInt(req.body.subcategoryId) : void 0,
        createdById: req.user.id,
        supportType: req.body.supportType || "remote",
        contactEmail: req.body.contactEmail,
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        contactDepartment: req.body.contactDepartment,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        attachmentUrl: req.file ? `/uploads/${req.file.filename}` : null,
        attachmentName: req.file ? req.file.originalname : null
      };
      if (req.body.assignedToId) {
        if (req.user.role === "admin") {
          processedData.assignedToId = parseInt(req.body.assignedToId);
        } else if (req.user.role === "agent") {
          processedData.assignedToId = parseInt(req.body.assignedToId);
        } else {
          delete processedData.assignedToId;
        }
      }
      let ticketData;
      try {
        ticketData = insertTicketSchema.parse(processedData);
      } catch (validationError) {
        let details = "";
        if (typeof validationError === "object" && validationError !== null) {
          if (Array.isArray(validationError.errors)) {
            details = JSON.stringify(validationError.errors);
          } else if (validationError.message) {
            details = validationError.message;
          } else {
            details = JSON.stringify(validationError);
          }
        } else {
          details = String(validationError);
        }
        console.error("Ticket validation error:", details);
        return res.status(400).json({ message: "Invalid ticket data", details });
      }
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      let details = "";
      if (typeof error === "object" && error !== null) {
        if (error.message) {
          details = error.message;
        } else {
          details = JSON.stringify(error);
        }
      } else {
        details = String(error);
      }
      console.error("Create ticket error:", details);
      res.status(400).json({ message: "Ticket creation failed", details });
    }
  });
  app2.patch("/api/tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      if (req.user?.role === "user" && ticket.createdById !== req.user.id) {
        return res.status(403).json({ message: "Access denied: You can only update your own tickets" });
      }
      if (req.user?.role === "agent" && ticket.assignedToId !== req.user.id) {
        return res.status(403).json({ message: "Access denied: You can only update tickets assigned to you" });
      }
      const updatedTicket = await storage.updateTicket(id, req.body);
      res.json(updatedTicket);
    } catch (error) {
      res.status(400).json({ message: "Failed to update ticket" });
    }
  });
  app2.put("/api/tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      if (req.user?.role !== "admin" && req.user?.role !== "agent" && ticket.createdById !== req.user?.id) {
        return res.status(403).json({ message: "Access denied: You can only edit your own tickets" });
      }
      const processedData = {
        ...req.body,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : void 0
      };
      Object.keys(processedData).forEach((key) => {
        if (processedData[key] === void 0 || typeof processedData[key] === "number" && isNaN(processedData[key])) {
          delete processedData[key];
        }
      });
      if (req.body.assignedToId !== void 0) {
        if (req.user?.role === "admin") {
          const assignedId = req.body.assignedToId ? parseInt(req.body.assignedToId) : null;
          processedData.assignedToId = !isNaN(assignedId) && assignedId !== null ? assignedId : null;
        } else if (req.user?.role === "agent" && ticket.createdById === req.user.id) {
          const assignedId = req.body.assignedToId ? parseInt(req.body.assignedToId) : null;
          processedData.assignedToId = !isNaN(assignedId) && assignedId !== null ? assignedId : null;
        } else if (req.user?.role === "user") {
          delete processedData.assignedToId;
        } else {
          delete processedData.assignedToId;
        }
      }
      if (req.body.status !== void 0) {
        if (req.user?.role === "admin" || req.user?.role === "agent") {
          processedData.status = req.body.status;
        } else {
          delete processedData.status;
        }
      }
      const updatedTicket = await storage.updateTicket(id, processedData);
      res.json(updatedTicket);
    } catch (error) {
      console.error("Update ticket error:", error);
      res.status(400).json({ message: "Failed to update ticket" });
    }
  });
  app2.delete("/api/tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      if (req.user?.role === "user" && ticket.createdById !== req.user.id) {
        return res.status(403).json({ message: "Access denied: You can only delete your own tickets" });
      }
      if (req.user?.role === "agent") {
        return res.status(403).json({ message: "Access denied: Agents cannot delete tickets" });
      }
      await storage.deleteTicket(id);
      res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      console.error("Delete ticket error:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });
  app2.get("/api/tickets/:ticketId/comments", isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      const comments2 = await storage.getTicketComments(ticketId);
      res.json(comments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  app2.post("/api/tickets/:ticketId/comments", isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      const commentData = insertCommentSchema.parse({
        ...req.body,
        ticketId,
        userId: req.user.id
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });
  app2.get("/api/faqs", async (req, res) => {
    try {
      let faqs2;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : void 0;
      if (categoryId) {
        faqs2 = await storage.getFaqsByCategory(categoryId);
      } else {
        faqs2 = await storage.getAllFaqs();
      }
      res.json(faqs2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });
  app2.get("/api/faqs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faq = await storage.getFaq(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ" });
    }
  });
  app2.post("/api/faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const faqData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(faqData);
      res.status(201).json(faq);
    } catch (error) {
      res.status(400).json({ message: "Invalid FAQ data" });
    }
  });
  app2.patch("/api/faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFaq = await storage.updateFaq(id, req.body);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: "Failed to update FAQ" });
    }
  });
  app2.get("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  app2.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const message = await storage.createChatMessage(messageData);
      const userMessage = message.message.toLowerCase();
      let botResponse = "Thank you for your message. How else can I assist you?";
      let ticketCreated = null;
      const issuePatterns = [
        {
          patterns: ["wifi", "network", "internet", "connection", "connectivity", "can't connect", "no internet"],
          category: "Network Issues",
          subcategory: "WiFi",
          defaultTitle: "Network connectivity issue"
        },
        {
          patterns: ["password", "reset", "login", "access", "account", "can't login", "forgot password"],
          category: "Account & Password",
          subcategory: "Password Reset",
          defaultTitle: "Password/Login issue"
        },
        {
          patterns: ["printer", "print", "printing", "can't print", "printer not working"],
          category: "Hardware",
          subcategory: "Printer",
          defaultTitle: "Printer issue"
        },
        {
          patterns: ["email", "outlook", "mail", "can't send", "can't receive"],
          category: "Email Services",
          subcategory: "Outlook",
          defaultTitle: "Email issue"
        },
        {
          patterns: ["computer", "laptop", "desktop", "slow", "frozen", "not working", "crash"],
          category: "Hardware",
          subcategory: "Desktop",
          defaultTitle: "Computer issue"
        },
        {
          patterns: ["software", "application", "app", "program", "error", "bug"],
          category: "Hardware",
          subcategory: "Desktop",
          defaultTitle: "Software issue"
        }
      ];
      const problemIndicators = ["can't", "cannot", "not working", "broken", "issue", "problem", "help", "error", "trouble", "unable", "fail"];
      const hasProblem = problemIndicators.some((indicator) => userMessage.includes(indicator));
      if (hasProblem) {
        const matchedIssue = issuePatterns.find(
          (issue) => issue.patterns.some((pattern) => userMessage.includes(pattern))
        );
        if (matchedIssue) {
          try {
            const categories2 = await storage.getAllCategories();
            const mainCategory = categories2.find((cat) => cat.name === matchedIssue.category && !cat.parentId);
            const subCategory = categories2.find((cat) => cat.name === matchedIssue.subcategory && cat.parentId === mainCategory?.id);
            if (mainCategory) {
              const ticketData = {
                title: matchedIssue.defaultTitle,
                description: `User message: ${message.message}

This ticket was automatically created by the AI assistant based on the user's chat message.`,
                status: "open",
                priority: "medium",
                supportType: "remote",
                categoryId: mainCategory.id,
                subcategoryId: subCategory?.id || null,
                createdById: req.user.id,
                assignedToId: null,
                contactEmail: req.user.email,
                contactName: req.user.name,
                contactPhone: req.user.contactNumber,
                contactDepartment: req.user.department
              };
              ticketCreated = await storage.createTicket(ticketData);
              botResponse = `I understand you're experiencing ${matchedIssue.defaultTitle.toLowerCase()}. I've automatically created a support ticket for you:

\u{1F3AB} **Ticket #${ticketCreated.id}** - ${ticketCreated.title}
\u{1F4CB} **Category:** ${matchedIssue.category}
\u{1F4DD} **Description:** Based on your message
\u23F0 **Status:** Open

Your ticket has been submitted and our IT team will review it shortly. You can track the progress in the 'My Tickets' section. Is there anything else I can help you with?`;
            }
          } catch (error) {
            console.error("Error creating automatic ticket:", error);
            botResponse = `I understand you're experiencing ${matchedIssue.defaultTitle.toLowerCase()}. I'd be happy to help you create a support ticket. You can create one manually using the 'Create Ticket' option, or I can guide you through the process. What specific details would you like to include?`;
          }
        } else {
          botResponse = "I can see you're experiencing an issue. I'd be happy to help you create a support ticket to get this resolved quickly. Can you tell me more specific details about what's not working? This will help me categorize your issue correctly.";
        }
      } else if (userMessage.includes("ticket status") || userMessage.includes("my tickets")) {
        botResponse = "You can view all your tickets and their current status in the 'My Tickets' section of the portal. Would you like me to direct you there, or do you have a specific ticket number you'd like me to help you with?";
      } else if (userMessage.includes("create ticket") || userMessage.includes("submit ticket")) {
        botResponse = "I can automatically create tickets for you! Just describe your issue in detail, and I'll detect the problem and create the appropriate ticket. For example, you could say 'My computer is running very slow' or 'I can't connect to WiFi'. What issue are you experiencing?";
      }
      const botMessage = await storage.createChatMessage({
        userId: req.user.id,
        message: botResponse,
        isFromBot: true
      });
      const response = [message, botMessage];
      if (ticketCreated) {
        response.push({ ticketCreated });
      }
      res.status(201).json(response);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });
  app2.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      let stats;
      if (req.user?.role === "admin") {
        stats = await storage.getDashboardStats();
      } else if (req.user?.role === "agent") {
        stats = await storage.getDashboardStatsForAgent(req.user.id);
      } else {
        stats = await storage.getDashboardStatsForUser(req.user.id);
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      let users2;
      if (req.user?.role === "admin") {
        users2 = await storage.getAllUsers();
      } else if (req.user?.role === "agent") {
        users2 = await storage.getUsersByRoles(["agent", "user"]);
      } else {
        users2 = [req.user];
      }
      res.json(users2);
    } catch (err) {
      console.error("Error in /api/users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { username, password, name, email, role } = req.body;
      if (!username || !password || !name || !email || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const existingUser = await storage.getUserByUsernameOrEmail(username, email);
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        email,
        role
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/users/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, name, email, role } = req.body;
      const existingUser = await storage.getUserById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updateData = { username, name, email, role };
      if (password && password.trim() !== "") {
        updateData.password = await bcrypt2.hash(password, 10);
      }
      const updatedUser = await storage.updateUser(parseInt(id), updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const existingUser = await storage.getUserById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.deleteUser(parseInt(id));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.put("/api/users/:id/password", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      if (parseInt(id) !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "You can only change your own password" });
      }
      const user = await storage.getUserById(parseInt(id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.user?.role !== "admin") {
        const isCurrentPasswordValid = await bcrypt2.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
      const hashedNewPassword = await bcrypt2.hash(newPassword, 10);
      await storage.updateUser(parseInt(id), { password: hashedNewPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  app2.get("/api/users/:id/export", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      if (parseInt(id) !== req.user?.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "You can only export your own data" });
      }
      const user = await storage.getUserById(parseInt(id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const tickets2 = await storage.getUserTickets(parseInt(id));
      const userComments = [];
      const sanitizedUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        department: user.department,
        designation: user.designation,
        contactNumber: user.contactNumber,
        createdAt: user.createdAt
      };
      const exportData = {
        user: sanitizedUser,
        tickets: tickets2,
        comments: userComments,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(exportData);
    } catch (error) {
      console.error("Export data error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });
  app2.post("/api/tickets/import", isAuthenticated, isSupportStaff, upload.single("csvFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }
      const results = [];
      const errors = [];
      let processed = 0;
      let created = 0;
      fs.createReadStream(req.file.path).pipe(csv()).on("data", (data) => results.push(data)).on("end", async () => {
        try {
          const categories2 = await storage.getAllCategories();
          const users2 = await storage.getAllUsers();
          for (const row of results) {
            processed++;
            try {
              const categoryValue = row.Category || row.category_id;
              let categoryId;
              if (categoryValue) {
                let category = categories2.find(
                  (c) => c.name.toLowerCase() === categoryValue.toLowerCase() || c.id === parseInt(categoryValue)
                );
                if (!category) {
                  try {
                    const existingCategory = await storage.getCategoryByName(categoryValue);
                    if (existingCategory) {
                      category = existingCategory;
                      categories2.push(category);
                    } else {
                      category = await storage.createCategory({
                        name: categoryValue,
                        parentId: null
                      });
                      categories2.push(category);
                      console.log(`Created new category: ${categoryValue}`);
                    }
                  } catch (error) {
                    errors.push(`Row ${processed}: Failed to create category "${categoryValue}": ${error instanceof Error ? error.message : "Unknown error"}`);
                    continue;
                  }
                }
                if (category) {
                  categoryId = category.id;
                } else {
                  errors.push(`Row ${processed}: Category "${categoryValue}" could not be found or created`);
                  continue;
                }
              }
              let createdById;
              const createdByValue = row["Created By Email"] || row.created_by_id;
              if (createdByValue) {
                let createdByUser = users2.find(
                  (u) => u.email?.toLowerCase() === createdByValue.toLowerCase() || u.name?.toLowerCase() === createdByValue.toLowerCase() || u.id === parseInt(createdByValue)
                );
                if (!createdByUser && createdByValue.trim()) {
                  try {
                    const trimmedName = createdByValue.trim();
                    if (!trimmedName || trimmedName.length < 1) {
                      console.warn(`Skipping user creation for empty name: "${createdByValue}"`);
                      createdById = req.user.id;
                      continue;
                    }
                    const baseUsername = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "");
                    const baseEmail = `${baseUsername}@imported.local`;
                    const existingUser = await storage.getUserByUsernameOrEmail(baseUsername, baseEmail);
                    if (existingUser) {
                      createdByUser = existingUser;
                      console.log(`Using existing user: ${trimmedName}`);
                    } else {
                      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
                      const hashedPassword = await bcrypt2.hash(randomPassword, 10);
                      createdByUser = await storage.createUser({
                        username: baseUsername,
                        password: hashedPassword,
                        name: trimmedName,
                        email: baseEmail,
                        role: "user"
                      });
                      console.log(`Created new user: ${trimmedName} (temp password will need reset)`);
                    }
                    users2.push(createdByUser);
                  } catch (error) {
                    console.warn(`Failed to create user "${createdByValue}": ${error instanceof Error ? error.message : "Unknown error"}`);
                    createdById = req.user.id;
                  }
                }
                if (createdByUser) {
                  createdById = createdByUser.id;
                } else {
                  createdById = req.user.id;
                }
              } else {
                createdById = req.user.id;
              }
              let assignedToId;
              const assignedToValue = row["Assigned To Email"] || row.assigned_to_id;
              if (assignedToValue && assignedToValue.trim()) {
                let assignedToUser = users2.find(
                  (u) => u.email?.toLowerCase() === assignedToValue.toLowerCase() || u.name?.toLowerCase() === assignedToValue.toLowerCase() || u.id === parseInt(assignedToValue)
                );
                if (!assignedToUser) {
                  try {
                    const trimmedName = assignedToValue.trim();
                    if (!trimmedName || trimmedName.length < 1) {
                      console.warn(`Skipping agent creation for empty name: "${assignedToValue}"`);
                      continue;
                    }
                    const baseUsername = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "");
                    const baseEmail = `${baseUsername}@imported.local`;
                    const existingUser = await storage.getUserByUsernameOrEmail(baseUsername, baseEmail);
                    if (existingUser) {
                      assignedToUser = existingUser;
                      console.log(`Using existing agent: ${trimmedName}`);
                    } else {
                      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
                      const hashedPassword = await bcrypt2.hash(randomPassword, 10);
                      assignedToUser = await storage.createUser({
                        username: baseUsername,
                        password: hashedPassword,
                        name: trimmedName,
                        email: baseEmail,
                        role: "agent"
                        // Assign agent role since they're handling tickets
                      });
                      console.log(`Created new agent: ${trimmedName} (temp password will need reset)`);
                    }
                    users2.push(assignedToUser);
                  } catch (error) {
                    console.warn(`Failed to create user "${assignedToValue}": ${error instanceof Error ? error.message : "Unknown error"}`);
                  }
                }
                if (assignedToUser) {
                  assignedToId = assignedToUser.id;
                }
              }
              let dueDate;
              const dueDateValue = row["Due Date"] || row.due_date;
              if (dueDateValue && dueDateValue.trim()) {
                try {
                  let dateStr = dueDateValue.trim();
                  if (dateStr.includes("@")) {
                    const parts = dateStr.split("@");
                    if (parts.length === 2) {
                      const datePart = parts[0].trim();
                      const timePart = parts[1].trim();
                      dateStr = `${datePart} ${timePart}`;
                    }
                  }
                  const parsedDate = new Date(dateStr);
                  if (!isNaN(parsedDate.getTime())) {
                    dueDate = parsedDate;
                  } else {
                    const dateRegex = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/;
                    const match = dateStr.match(dateRegex);
                    if (match) {
                      const month = parseInt(match[1]) - 1;
                      const day = parseInt(match[2]);
                      const year = parseInt(match[3]);
                      const testDate = new Date(year, month, day);
                      if (!isNaN(testDate.getTime())) {
                        dueDate = testDate;
                      }
                    }
                  }
                } catch (error) {
                  console.warn(`Failed to parse due date "${dueDateValue}" for row ${processed}: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
              }
              const rawStatus = (row.Status || row.status)?.toLowerCase()?.trim() || "open";
              const rawPriority = (row.Priority || row.priority)?.toLowerCase()?.trim() || "medium";
              const rawSupportType = (row["Support Type"] || row.support_type)?.toLowerCase()?.trim() || "remote";
              const validStatuses = ["open", "in-progress", "resolved", "closed"];
              const status = validStatuses.includes(rawStatus) ? rawStatus : "open";
              if (!validStatuses.includes(rawStatus)) {
                console.warn(`Invalid status "${rawStatus}" for row ${processed}, defaulting to "open"`);
              }
              const validPriorities = ["low", "medium", "high"];
              const priority = validPriorities.includes(rawPriority) ? rawPriority : "medium";
              if (!validPriorities.includes(rawPriority)) {
                console.warn(`Invalid priority "${rawPriority}" for row ${processed}, defaulting to "medium"`);
              }
              const supportTypeMap = {
                "remote": "remote",
                "telephonic": "telephonic",
                "onsite_visit": "onsite_visit",
                "onsite visit": "onsite_visit",
                "on-site visit": "onsite_visit",
                "other": "other"
              };
              const supportType = supportTypeMap[rawSupportType] || "remote";
              if (!supportTypeMap[rawSupportType]) {
                console.warn(`Invalid support type "${rawSupportType}" for row ${processed}, defaulting to "remote"`);
              }
              const ticketData = {
                title: (row.Title || row.title || "Imported Ticket").trim(),
                description: (row.Description || row.description || "No description provided").trim(),
                status,
                priority,
                supportType,
                contactEmail: row["Contact Email"] || row.contact_email || null,
                contactName: row["Contact Name"] || row.contact_name || null,
                contactPhone: row["Contact Phone"] || row.contact_phone || null,
                contactDepartment: row["Contact Department"] || row.contact_department || null,
                categoryId,
                createdById,
                assignedToId: assignedToId || null,
                dueDate: dueDate || null
                // Note: createdAt and updatedAt are excluded from insertTicketSchema
              };
              const validatedData = insertTicketSchema.parse(ticketData);
              await storage.createTicket(validatedData);
              created++;
            } catch (error) {
              errors.push(`Row ${processed}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
          }
          fs.unlinkSync(req.file.path);
          res.json({
            message: `Import completed. ${created} tickets created out of ${processed} processed.`,
            processed,
            created,
            errors: errors.length > 0 ? errors : null
          });
        } catch (error) {
          console.error("CSV import error:", error);
          res.status(500).json({ message: "Failed to process CSV file" });
        }
      }).on("error", (error) => {
        console.error("CSV parsing error:", error);
        res.status(500).json({ message: "Failed to parse CSV file" });
      });
    } catch (error) {
      console.error("CSV import error:", error);
      res.status(500).json({ message: "Failed to import tickets" });
    }
  });
  app2.get("/api/reports/agent-performance", isAuthenticated, isSupportStaff, async (req, res) => {
    try {
      const agents = await storage.getUsersByRoles(["agent", "admin"]);
      const agentPerformance = await Promise.all(
        agents.map(async (agent) => {
          const assignedTickets = await storage.getAssignedTickets(agent.id);
          const totalTickets = assignedTickets.length;
          const resolvedTickets = assignedTickets.filter(
            (ticket) => ticket.status === "resolved" || ticket.status === "closed"
          );
          let avgResolutionTime = 0;
          if (resolvedTickets.length > 0) {
            const totalResolutionTime = resolvedTickets.reduce((total, ticket) => {
              const createdTime = new Date(ticket.createdAt || ticket.updatedAt || Date.now()).getTime();
              const updatedTime = new Date(ticket.updatedAt || ticket.createdAt || Date.now()).getTime();
              return total + (updatedTime - createdTime);
            }, 0);
            avgResolutionTime = totalResolutionTime / (resolvedTickets.length * 1e3 * 60 * 60);
          }
          const slaCompliantTickets = resolvedTickets.filter((ticket) => {
            const createdTime = new Date(ticket.createdAt || ticket.updatedAt || Date.now()).getTime();
            const updatedTime = new Date(ticket.updatedAt || ticket.createdAt || Date.now()).getTime();
            const resolutionTimeHours = (updatedTime - createdTime) / (1e3 * 60 * 60);
            return resolutionTimeHours <= 24;
          });
          const slaComplianceRate = resolvedTickets.length > 0 ? Math.round(slaCompliantTickets.length / resolvedTickets.length * 100) : 0;
          return {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            department: agent.department,
            tickets: totalTickets,
            resolvedTickets: resolvedTickets.length,
            avgTime: Math.round(avgResolutionTime * 10) / 10,
            // Round to 1 decimal
            slaMet: slaComplianceRate,
            activeTickets: assignedTickets.filter((t) => t.status === "open" || t.status === "in-progress").length
          };
        })
      );
      agentPerformance.sort((a, b) => b.tickets - a.tickets);
      res.json(agentPerformance);
    } catch (error) {
      console.error("Agent performance fetch error:", error);
      res.status(500).json({ message: "Failed to fetch agent performance data" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getAllCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });
  app2.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const updatedCategory = await storage.updateCategory(id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2 from "path";
import fs2 from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  // 👇 Important: set base path for subfolder
  base: "/itsm_app/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    // 👇 Put final build directly in `dist`
    outDir: path2.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        {
          name: "copy-redirects",
          closeBundle() {
            const from = path2.resolve(import.meta.dirname, "_redirects");
            const to = path2.resolve(import.meta.dirname, "dist/_redirects");
            if (fs2.existsSync(from)) {
              fs2.copyFileSync(from, to);
            }
          }
        }
      ]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  const host = "0.0.0.0";
  server.listen(port, host, () => {
    log(`\u{1F680} Server running at http://${host}:${port}`);
  });
})();
