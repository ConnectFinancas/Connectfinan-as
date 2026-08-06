import { ClientFinanceData } from "@/lib/types";
import { m4LogisticaData } from "@/lib/data/m4-logistica";
import { thiagoBikeData } from "@/lib/data/thiago-bike";

export const financeRegistry: Record<string, ClientFinanceData> = {
  "m4-logistica": m4LogisticaData,
  "thiago-bike": thiagoBikeData,
};

export function getFinanceData(slug: string): ClientFinanceData | undefined {
  return financeRegistry[slug];
}
