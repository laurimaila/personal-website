import { timestamp, numeric, pgTable } from 'drizzle-orm/pg-core';

export const hourlyPricesView = pgTable('v_electricity_prices', {
  timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }),
  priceCentKwh: numeric('price_cent_kwh'),
  priceVatCentKwh: numeric('price_vat_cent_kwh'),
});

export const dailyPricesView = pgTable('v_daily_electricity_prices', {
  bucketDay: timestamp('bucket_day', { withTimezone: true, mode: 'date' }),
  avgPriceCentKwh: numeric('avg_price_cent_kwh'),
  avgPriceVatCentKwh: numeric('avg_price_vat_cent_kwh'),
});

export const monthlyPricesView = pgTable('v_monthly_electricity_prices', {
  bucketMonth: timestamp('bucket_month', { withTimezone: true, mode: 'date' }),
  avgPriceCentKwh: numeric('avg_price_cent_kwh'),
  avgPriceVatCentKwh: numeric('avg_price_vat_cent_kwh'),
});
