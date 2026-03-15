import { db } from '@/lib/db';
import { vElectricityPrices } from '@/lib/db/schema';
import { asc, gte, lte, and, sql } from 'drizzle-orm';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { NextResponse, NextRequest } from 'next/server';

// History data can be aggressively cached
export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');
  const type = searchParams.get('type'); // 'daily' or 'monthly' or null for 15 minute data

  if (!startParam || !endParam) {
    return NextResponse.json({ error: 'Missing start or end parameters' }, { status: 400 });
  }

  try {
    const startDate = startOfDay(parseISO(startParam));
    const endDate = endOfDay(parseISO(endParam));

    if (!db) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    if (!type) {
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

      return NextResponse.json(
        prices.map((p) => ({
          timestamp: p.timestamp,
          price: p.price ? parseFloat(p.price) : null,
          priceVat: p.priceVat ? parseFloat(p.priceVat) : null,
        })),
      );
    }

    // Daily averages for "Month" view
    if (type === 'daily') {
      const dailyPrices = await db
        .select({
          timestamp: sql<Date>`DATE_TRUNC('day', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki')`,
          price: sql<number>`AVG(NULLIF(CAST(${vElectricityPrices.price} AS NUMERIC), 0))`,
          priceVat: sql<number>`AVG(NULLIF(CAST(${vElectricityPrices.priceVat} AS NUMERIC), 0))`,
        })
        .from(vElectricityPrices)
        .where(
          and(
            gte(vElectricityPrices.timestamp, startDate),
            lte(vElectricityPrices.timestamp, endDate),
          ),
        )
        .groupBy(
          sql`DATE_TRUNC('day', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki')`,
        )
        .having(
          sql`DATE_TRUNC('day', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki') >= ${startDate.toISOString()}`,
        )
        .orderBy(
          asc(
            sql`DATE_TRUNC('day', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki')`,
          ),
        );

      return NextResponse.json(dailyPrices);
    }

    // Monthly averages for "Year" view
    if (type === 'monthly') {
      const monthlyPrices = await db
        .select({
          timestamp: sql<Date>`DATE_TRUNC('month', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki')`,
          price: sql<number>`AVG(NULLIF(CAST(${vElectricityPrices.price} AS NUMERIC), 0))`,
          priceVat: sql<number>`AVG(NULLIF(CAST(${vElectricityPrices.priceVat} AS NUMERIC), 0))`,
        })
        .from(vElectricityPrices)
        .where(
          and(
            gte(vElectricityPrices.timestamp, startDate),
            lte(vElectricityPrices.timestamp, endDate),
          ),
        )
        .groupBy(
          sql`DATE_TRUNC('month', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki')`,
        )
        .having(
          sql`DATE_TRUNC('month', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki') >= ${startDate.toISOString()}`,
        )
        .orderBy(
          asc(
            sql`DATE_TRUNC('month', ${vElectricityPrices.timestamp} AT TIME ZONE 'Europe/Helsinki')`,
          ),
        );

      return NextResponse.json(monthlyPrices);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (e) {
    console.error('Failed to fetch historical electricity prices:', e);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
