import { db } from '@/lib/db';
import { vElectricityPrices } from '@/lib/db/schema';
import { asc, gte, lte, and } from 'drizzle-orm';
import { PriceChart } from './PriceDisplay';
import { subDays, startOfDay, addDays, endOfDay } from 'date-fns';
import { PriceData } from '@/lib/types';

export const revalidate = 600; // 10 minutes

export default async function ElectricityPage() {
  const nowHelsinki = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));

  const startDate = startOfDay(subDays(nowHelsinki, 2));
  const endDate = endOfDay(addDays(nowHelsinki, 1));

  let chartData: PriceData[] = [];
  let error = false;

  try {
    if (db) {
      const prices = await db
        .select()
        .from(vElectricityPrices)
        .where(
          and(
            gte(vElectricityPrices.timestamp, startDate),
            lte(vElectricityPrices.timestamp, endDate),
          ),
        )
        .orderBy(asc(vElectricityPrices.timestamp));

      chartData = prices.map((p) => ({
        timestamp: p.timestamp as Date,
        price: p.price ? parseFloat(p.price) : null,
        priceVat: p.priceVat ? parseFloat(p.priceVat) : null,
      }));
    } else {
      console.warn('Database connection not initialized, skipping electricity price fetch');
    }
  } catch (e) {
    console.error('Failed to fetch electricity prices:', e);
    error = true;
  }

  return (
    <div className="container mx-auto px-0 py-4 sm:px-4 sm:py-10">
      <div className="flex flex-col gap-4 sm:gap-8">
        {chartData.length > 0 ? (
          <PriceChart data={chartData} />
        ) : (
          <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              {error
                ? 'Temporary connection issue. Please try again in a few minutes.'
                : 'Price data unavailable, please check back later.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
