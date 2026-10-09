import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

const id = () => uuid("id").defaultRandom().primaryKey()
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull()

export const agencies = pgTable("agencies", {
  id: id(), name: text("name").notNull(), legalName: text("legal_name"), taxId: text("tax_id"), address: text("address"), phone: text("phone"), email: text("email"), defaultCommission: numeric("default_commission", { precision: 5, scale: 2 }).default("10").notNull(), contractFeePercent: numeric("contract_fee_percent", { precision: 5, scale: 2 }).default("5").notNull(), createdAt: createdAt(),
})

export const appUsers = pgTable("app_users", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), email: text("email").notNull(), name: text("name"), role: text("role").default("operator").notNull(), createdAt: createdAt(),
}, table => ({ emailByAgency: uniqueIndex("app_users_agency_email_idx").on(table.agencyId, table.email) }))

export const owners = pgTable("owners", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), name: text("name").notNull(), phone: text("phone"), email: text("email"), address: text("address"), document: text("document"), bankAccount: text("bank_account"), notes: text("notes"), createdAt: createdAt(),
})

export const tenants = pgTable("tenants", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), name: text("name").notNull(), phone: text("phone"), email: text("email"), document: text("document"), notes: text("notes"), createdAt: createdAt(),
})

export const properties = pgTable("properties", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), ownerId: uuid("owner_id").references(() => owners.id), tenantId: uuid("tenant_id").references(() => tenants.id), address: text("address").notNull(), unit: text("unit"), rent: numeric("rent", { precision: 14, scale: 2 }).default("0").notNull(), commission: numeric("commission", { precision: 5, scale: 2 }).default("10").notNull(), propertyStatus: text("property_status").default("Disponible").notNull(), collectionStatus: text("collection_status").default("No alquilada").notNull(), createdAt: createdAt(),
})

export const propertyCharges = pgTable("property_charges", {
  id: id(), propertyId: uuid("property_id").notNull().references(() => properties.id), epe: numeric("epe", { precision: 14, scale: 2 }).default("0").notNull(), gas: numeric("gas", { precision: 14, scale: 2 }).default("0").notNull(), aguas: numeric("aguas", { precision: 14, scale: 2 }).default("0").notNull(), tgi: numeric("tgi", { precision: 14, scale: 2 }).default("0").notNull(), api: numeric("api", { precision: 14, scale: 2 }).default("0").notNull(), expensas: numeric("expensas", { precision: 14, scale: 2 }).default("0").notNull(), extraordinary: numeric("extraordinary", { precision: 14, scale: 2 }).default("0").notNull(), updatedAt: createdAt(),
})

export const contracts = pgTable("contracts", {
  id: id(), propertyId: uuid("property_id").notNull().references(() => properties.id), startDate: date("start_date"), endDate: date("end_date"), initialRent: numeric("initial_rent", { precision: 14, scale: 2 }).default("0").notNull(), totalContract: numeric("total_contract", { precision: 14, scale: 2 }).default("0").notNull(), deposit: numeric("deposit", { precision: 14, scale: 2 }).default("0").notNull(), adjustment: text("adjustment"), adjustmentPeriod: text("adjustment_period"), tenantDocument: text("tenant_document"), guarantors: text("guarantors"), guarantees: text("guarantees"), noticeMonths: integer("notice_months").default(3).notNull(), terminationDate: date("termination_date"), terminationNoticeMonths: integer("termination_notice_months"), status: text("status").default("Borrador").notNull(), createdAt: createdAt(),
})

export const contractDocuments = pgTable("contract_documents", {
  id: id(), contractId: uuid("contract_id").notNull().references(() => contracts.id), name: text("name").notNull(), description: text("description"), storageKey: text("storage_key").notNull(), mimeType: text("mime_type"), createdAt: createdAt(),
})

export const contractIncidents = pgTable("contract_incidents", {
  id: id(), contractId: uuid("contract_id").notNull().references(() => contracts.id), date: date("date").notNull(), kind: text("kind").notNull(), title: text("title").notNull(), notes: text("notes"), createdAt: createdAt(),
})

export const monthlyPayments = pgTable("monthly_payments", {
  id: id(), propertyId: uuid("property_id").notNull().references(() => properties.id), month: text("month").notNull(), status: text("status").notNull(), paidDate: date("paid_date"), rent: numeric("rent", { precision: 14, scale: 2 }).default("0").notNull(), taxes: numeric("taxes", { precision: 14, scale: 2 }).default("0").notNull(), commission: numeric("commission", { precision: 14, scale: 2 }).default("0").notNull(), collected: numeric("collected", { precision: 14, scale: 2 }).default("0").notNull(), pending: numeric("pending", { precision: 14, scale: 2 }).default("0").notNull(), ownerPaid: boolean("owner_paid").default(false).notNull(), ownerPaidDate: date("owner_paid_date"), createdAt: createdAt(),
}, table => ({ propertyMonthIdx: uniqueIndex("monthly_payments_property_month_idx").on(table.propertyId, table.month) }))

export const movements = pgTable("movements", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), propertyId: uuid("property_id").references(() => properties.id), kind: text("kind").notNull(), concept: text("concept"), amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), applied: numeric("applied", { precision: 14, scale: 2 }).default("0").notNull(), date: date("date").notNull(), notes: text("notes"), metadata: jsonb("metadata"), createdAt: createdAt(),
})

export const monthClosings = pgTable("month_closings", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), month: text("month").notNull(), status: text("status").default("Abierto").notNull(), closedAt: timestamp("closed_at", { withTimezone: true }),
}, table => ({ agencyMonthIdx: uniqueIndex("month_closings_agency_month_idx").on(table.agencyId, table.month) }))

export const ownerPayments = pgTable("owner_payments", {
  id: id(), ownerId: uuid("owner_id").notNull().references(() => owners.id), date: date("date").notNull(), amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), notes: text("notes"), createdAt: createdAt(),
})

export const authUsers = pgTable("auth_users", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), username: text("username").notNull(), passwordHash: text("password_hash").notNull(), createdAt: createdAt(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, table => ({ agencyIdx: uniqueIndex("auth_users_agency_idx").on(table.agencyId), usernameIdx: uniqueIndex("auth_users_username_idx").on(table.username) }))

export const settings = pgTable("settings", {
  id: id(), agencyId: uuid("agency_id").notNull().references(() => agencies.id), key: text("key").notNull(), value: jsonb("value").notNull(),
}, table => ({ agencyKeyIdx: uniqueIndex("settings_agency_key_idx").on(table.agencyId, table.key) }))
