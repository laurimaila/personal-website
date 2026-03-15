import { db } from '@/lib/db';
import { vElectricityPrices } from '@/lib/db/schema';
import { asc, gte } from 'drizzle-orm';
import { PriceChart } from './PriceDisplay';
import { subDays } from 'date-fns';
import { PriceData } from '@/lib/types';

export const revalidate = 1800;

export default async function ElectricityPage() {
  const now = new Date();
  const oneYearAgo = subDays(now, 365);
  // Finland moved to 15 minute pricing in 1.10.2025
  const hardLimit = new Date('2025-10-01T00:00:00Z');

  const startDate = oneYearAgo > hardLimit ? oneYearAgo : hardLimit;

  let chartData: PriceData[] = [];
  let error = false;

  try {
    if (db) {
      const prices = await db
        .select()
        .from(vElectricityPrices)
        .where(gte(vElectricityPrices.timestamp, startDate))
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
                : 'Price data currently unavailable.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
