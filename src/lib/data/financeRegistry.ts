import { ClientFinanceData } from "@/lib/types";
import { m4LogisticaData } from "@/lib/data/m4-logistica";
import { thiagoBikeData } from "@/lib/data/thiago-bike";
import { mjPrimeData } from "@/lib/data/mj-prime";
import { everShoppingData } from "@/lib/data/ever-shopping";
import { mjShoesData } from "@/lib/data/mj-shoes";
import { storePlussData } from "@/lib/data/store-pluss";
import { connectData } from "@/lib/data/connect";
import { laModasData } from "@/lib/data/la-modas";
import { connectEcommerceData } from "@/lib/data/connect-ecommerce";

export const financeRegistry: Record<string, ClientFinanceData> = {
  "m4-logistica": m4LogisticaData,
  "thiago-bike": thiagoBikeData,
  "mj-prime": mjPrimeData,
  "ever-shopping": everShoppingData,
  "mj-shoes": mjShoesData,
  "store-pluss": storePlussData,
  connect: connectData,
  "la-modas": laModasData,
  "connect-ecommerce": connectEcommerceData,
};

export function getFinanceData(slug: string): ClientFinanceData | undefined {
  return financeRegistry[slug];
}
