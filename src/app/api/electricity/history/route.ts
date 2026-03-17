import { db } from '@/lib/db';
import { hourlyPricesView, dailyPricesView, monthlyPricesView } from '@/lib/db/schema';
import { and, gte, lt, asc } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

export const revalidate = 600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const granularity = (searchParams.get('granularity') || 'hourly') as
    | 'hourly'
    | 'daily'
    | 'monthly';

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from or to parameter' }, { status: 400 });
  }

  try {
    if (!db)
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });

    const fromDate = new Date(from);
    const toDate = new Date(to);

    let query;
    if (granularity === 'hourly') {
      query = db
        .select({
          timestamp: hourlyPricesView.timestamp,
          price: hourlyPricesView.priceCentKwh,
          priceVat: hourlyPricesView.priceVatCentKwh,
        })
        .from(hourlyPricesView)
        .where(
          and(gte(hourlyPricesView.timestamp, fromDate), lt(hourlyPricesView.timestamp, toDate)),
        )
        .orderBy(asc(hourlyPricesView.timestamp));
    } else if (granularity === 'daily') {
      query = db
        .select({
          timestamp: dailyPricesView.bucketDay,
          price: dailyPricesView.avgPriceCentKwh,
          priceVat: dailyPricesView.avgPriceVatCentKwh,
        })
        .from(dailyPricesView)
        .where(and(gte(dailyPricesView.bucketDay, fromDate), lt(dailyPricesView.bucketDay, toDate)))
        .orderBy(asc(dailyPricesView.bucketDay));
    } else {
      query = db
        .select({
          timestamp: monthlyPricesView.bucketMonth,
          price: monthlyPricesView.avgPriceCentKwh,
          priceVat: monthlyPricesView.avgPriceVatCentKwh,
        })
        .from(monthlyPricesView)
        .where(
          and(
            gte(monthlyPricesView.bucketMonth, fromDate),
            lt(monthlyPricesView.bucketMonth, toDate),
          ),
        )
        .orderBy(asc(monthlyPricesView.bucketMonth));
    }

    const prices = await query;
    return NextResponse.json(prices);
  } catch (e) {
    console.error(`Failed to fetch ${granularity} history:`, e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
