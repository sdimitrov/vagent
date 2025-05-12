import { pgTable, uuid, text, varchar, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const socialConnections = pgTable('social_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Matches Clerk User ID format
  platform: varchar('platform', { length: 50 }).notNull(), // e.g., 'youtube', 'tiktok'
  platformUserId: varchar('platform_user_id', { length: 255 }).notNull(),
  platformUsername: varchar('platform_username', { length: 255 }),
  accessToken: text('access_token').notNull(),       // Encrypted
  refreshToken: text('refresh_token'),                 // Encrypted
  scopes: text('scopes'),                              // Comma-separated string of scopes
  tokenType: varchar('token_type', { length: 50 }),    // e.g., 'Bearer'
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }),
  connectionStatus: varchar('connection_status', { length: 50 }).notNull().default('active'), // e.g., 'active', 'revoked', 'expired', 'error'
  lastValidatedAt: timestamp('last_validated_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => {
  return {
    // Unique constraint on user_id, platform, and platform_user_id to prevent duplicates
    // However, platformUserId should be unique per platform for a user. 
    // A simpler unique index might be on (userId, platform) if a user can only connect one account per platform.
    // Or on (platform, platformUserId) if platformUserId is globally unique per platform.
    // For now, let's assume a user can only have one connection of a specific platformUserId for a given platform.
    platformUserUniqueIdx: uniqueIndex('platform_user_unique_idx').on(table.userId, table.platform, table.platformUserId),
    userIdIdx: uniqueIndex('user_id_idx').on(table.userId), // Index for faster lookups by user_id
  };
});

// We can add other tables here as needed, for example, for user preferences, video metadata, etc. 