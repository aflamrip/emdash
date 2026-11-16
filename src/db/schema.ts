import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

// Movies Table
export const ecMovies = sqliteTable("ec_movies", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	featuredImage: text("featured_image"),
	release: text("release"),
	duration: integer("duration"),
	excerpt: text("excerpt"),
	video: text("video"),
	subtitle: text("subtitle"),
	director: text("director"),
	peoples: text("peoples"),
	status: text("status").default("published"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	publishedAt: text("published_at"),
});

// TV Series Table
export const ecTv = sqliteTable("ec_tv", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	featuredImage: text("featured_image"),
	release: text("release"),
	excerpt: text("excerpt"),
	director: text("director"),
	peoples: text("peoples"),
	seasons: text("seasons"),
	status: text("status").default("published"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	publishedAt: text("published_at"),
});

// Seasons Table
export const ecSeasons = sqliteTable("ec_seasons", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	seasonNumber: integer("season_number").notNull(),
	featuredImage: text("featured_image"),
	release: text("release"),
	excerpt: text("excerpt"),
	tv: text("tv"),
	episodes: text("episodes"),
	status: text("status").default("published"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	publishedAt: text("published_at"),
});

// Episodes Table
export const ecEpisodes = sqliteTable("ec_episodes", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	episodeNumber: integer("episode_number").notNull(),
	duration: integer("duration"),
	excerpt: text("excerpt"),
	video: text("video"),
	subtitle: text("subtitle"),
	featuredImage: text("featured_image"),
	seasons: text("seasons"),
	status: text("status").default("published"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	publishedAt: text("published_at"),
});

// People / Cast Table
export const ecPeople = sqliteTable("ec_people", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	photo: text("photo"),
	bio: text("bio"),
	directorMovies: text("director_movies"),
	directorTv: text("director_tv"),
	peoplesMovies: text("peoples_movies"),
	peoplesTv: text("peoples_tv"),
	status: text("status").default("published"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	publishedAt: text("published_at"),
});

// Taxonomies Table
export const taxonomies = sqliteTable("taxonomies", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	label: text("label").notNull(),
	sortOrder: integer("sort_order").default(0),
});

// Content Taxonomies Join Table
export const contentTaxonomies = sqliteTable("content_taxonomies", {
	id: text("id").primaryKey(),
	contentId: text("content_id").notNull(),
	taxonomyId: text("taxonomy_id").notNull(),
});

// Drizzle Relations for Eager Loading
export const ecMoviesRelations = relations(ecMovies, ({ one }) => ({
	directorPerson: one(ecPeople, {
		fields: [ecMovies.director],
		references: [ecPeople.id],
	}),
}));

export const ecTvRelations = relations(ecTv, ({ many, one }) => ({
	seasonsList: many(ecSeasons),
	directorPerson: one(ecPeople, {
		fields: [ecTv.director],
		references: [ecPeople.id],
	}),
}));

export const ecSeasonsRelations = relations(ecSeasons, ({ one, many }) => ({
	series: one(ecTv, {
		fields: [ecSeasons.tv],
		references: [ecTv.id],
	}),
	episodesList: many(ecEpisodes),
}));

export const ecEpisodesRelations = relations(ecEpisodes, ({ one }) => ({
	season: one(ecSeasons, {
		fields: [ecEpisodes.seasons],
		references: [ecSeasons.id],
	}),
}));

// Zod Schemas for Validation
export const selectMovieSchema = createSelectSchema(ecMovies);
export const insertMovieSchema = createInsertSchema(ecMovies);
export const selectTvSchema = createSelectSchema(ecTv);
export const insertTvSchema = createInsertSchema(ecTv);
export const selectSeasonSchema = createSelectSchema(ecSeasons);
export const selectEpisodeSchema = createSelectSchema(ecEpisodes);
export const selectPersonSchema = createSelectSchema(ecPeople);

export type Movie = typeof ecMovies.$inferSelect;
export type TVSeries = typeof ecTv.$inferSelect;
export type Season = typeof ecSeasons.$inferSelect;
export type Episode = typeof ecEpisodes.$inferSelect;
export type Person = typeof ecPeople.$inferSelect;
