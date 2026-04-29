import { db } from '@/lib/db';
import { hourlyPricesView, dailyPricesView, monthlyPricesView } from '@/lib/db/schema';
import { addDays, startOfDay, startOfMonth, addMonths } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { and, gte, lt, asc } from 'drizzle-orm';
import { PricePoint } from './types';

const TZ = 'Europe/Helsinki';

export async function getHourlyPrices(startDate: Date, endDate: Date): Promise<PricePoint[]> {
  if (!db) return [];

  try {
    const data = await db
      .select({
        timestamp: hourlyPricesView.timestamp,
        priceCentKwh: hourlyPricesView.priceCentKwh,
        priceVatCentKwh: hourlyPricesView.priceVatCentKwh,
      })
      .from(hourlyPricesView)
      .where(
        and(gte(hourlyPricesView.timestamp, startDate), lt(hourlyPricesView.timestamp, endDate)),
      )
      .orderBy(asc(hourlyPricesView.timestamp));

    return data.map((row) => ({
      timestamp: row.timestamp ? (row.timestamp as Date).toISOString() : '',
      price: row.priceCentKwh ? parseFloat(row.priceCentKwh) : null,
      priceVat: row.priceVatCentKwh ? parseFloat(row.priceVatCentKwh) : null,
    }));
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.warn('getHourlyPrices failed:', cause);
    return [];
  }
}

export async function getDailyPrices(startDate: Date, endDate: Date): Promise<PricePoint[]> {
  if (!db) return [];
  try {
    const nowHelsinki = toZonedTime(new Date(), TZ);
    const tomorrowStart = fromZonedTime(addDays(startOfDay(nowHelsinki), 1), TZ);

    const data = await db
      .select({
        bucketDay: dailyPricesView.bucketDay,
        avgPriceCentKwh: dailyPricesView.avgPriceCentKwh,
        avgPriceVatCentKwh: dailyPricesView.avgPriceVatCentKwh,
      })
      .from(dailyPricesView)
      .where(
        and(
          gte(dailyPricesView.bucketDay, startDate),
          lt(dailyPricesView.bucketDay, endDate),
          lt(dailyPricesView.bucketDay, tomorrowStart),
        ),
      )
      .orderBy(asc(dailyPricesView.bucketDay));

    return data.map((row) => ({
      timestamp: row.bucketDay ? (row.bucketDay as Date).toISOString() : '',
      price: row.avgPriceCentKwh ? parseFloat(row.avgPriceCentKwh) : null,
      priceVat: row.avgPriceVatCentKwh ? parseFloat(row.avgPriceVatCentKwh) : null,
    }));
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.warn('getDailyPrices failed:', cause);
    return [];
  }
}

export async function getMonthlyPrices(startDate: Date, endDate: Date): Promise<PricePoint[]> {
  if (!db) return [];
  try {
    const nowHelsinki = toZonedTime(new Date(), TZ);
    const nextMonthStart = fromZonedTime(addMonths(startOfMonth(nowHelsinki), 1), TZ);

    const data = await db
      .select({
        bucketMonth: monthlyPricesView.bucketMonth,
        avgPriceCentKwh: monthlyPricesView.avgPriceCentKwh,
        avgPriceVatCentKwh: monthlyPricesView.avgPriceVatCentKwh,
      })
      .from(monthlyPricesView)
      .where(
        and(
          gte(monthlyPricesView.bucketMonth, startDate),
          lt(monthlyPricesView.bucketMonth, endDate),
          lt(monthlyPricesView.bucketMonth, nextMonthStart),
        ),
      )
      .orderBy(asc(monthlyPricesView.bucketMonth));

    return data.map((row) => ({
      timestamp: row.bucketMonth ? (row.bucketMonth as Date).toISOString() : '',
      price: row.avgPriceCentKwh ? parseFloat(row.avgPriceCentKwh) : null,
      priceVat: row.avgPriceVatCentKwh ? parseFloat(row.avgPriceVatCentKwh) : null,
    }));
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.warn('getMonthlyPrices failed:', cause);
    return [];
  }
}
