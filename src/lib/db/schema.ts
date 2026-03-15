import { timestamp, numeric, pgView } from 'drizzle-orm/pg-core';

export const vElectricityPrices = pgView('v_electricity_prices', {
  timestamp: timestamp('timestamp'),
  price: numeric('price_cent_kwh'),
  priceVat: numeric('price_vat_cent_kwh'),
  createdAt: timestamp('created_at'),
}).existing();
