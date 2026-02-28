import type { Ingredient, StockLog, StockType, Staff, StaffRole, StaffStatus } from "@/generated/prisma/client";

export type { Ingredient, StockLog, StockType, Staff, StaffRole, StaffStatus };

export type IngredientWithLogs = Ingredient & { stockLogs: StockLog[] };
