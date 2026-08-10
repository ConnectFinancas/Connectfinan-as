import { ClientFinanceData } from "@/lib/types";
import { m4LogisticaData } from "@/lib/data/m4-logistica";
import { thiagoBikeData } from "@/lib/data/thiago-bike";
import { mjPrimeData } from "@/lib/data/mj-prime";

export const financeRegistry: Record<string, ClientFinanceData> = {
  "m4-logistica": m4LogisticaData,
  "thiago-bike": thiagoBikeData,
  "mj-prime": mjPrimeData,
};

export function getFinanceData(slug: string): ClientFinanceData | undefined {
  return financeRegistry[slug];
}
