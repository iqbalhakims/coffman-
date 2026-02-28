import type { Ingredient, StockLog, StockType } from "@/generated/prisma/client";

export type { Ingredient, StockLog, StockType };

export type IngredientWithLogs = Ingredient & { stockLogs: StockLog[] };
