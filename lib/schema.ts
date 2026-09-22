import {
  pgTable,
  serial,
  varchar,
  numeric,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  location: varchar("location", { length: 255 }),

  budget: numeric("budget", {
    precision: 15,
    scale: 2,
  }).default("0"),

  spent: numeric("spent", {
    precision: 15,
    scale: 2,
  }).default("0"),

  manager: varchar("manager", { length: 255 }),

  description: text("description"),

  start_date: varchar("start_date", {
    length: 50,
  }),

  end_date: varchar("end_date", {
    length: 50,
  }),

  status: varchar("status", {
    length: 50,
  }).default("On Track"),

  progress: integer("progress").default(0),
});