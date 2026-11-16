import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(d1Binding?: any) {
	if (!d1Binding) {
		return null;
	}
	return drizzle(d1Binding, { schema });
}

export type DbClient = ReturnType<typeof getDb>;
