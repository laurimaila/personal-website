import { getHourlyPrices, getDailyPrices, getMonthlyPrices } from '../../data-fetching';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  format,
  parseISO,
  isValid,
} from 'date-fns';
import { ElectricityPrice } from '../../ElectricityPrice';
import { ViewType, PricePoint } from '../../types';
import { notFound } from 'next/navigation';

export const revalidate = 600;

interface Props {
  params: Promise<{
    view: string;
    date: string;
  }>;
}

const VIEW_MAP: Record<string, ViewType> = {
  day: 'Day',
  month: 'Month',
  year: 'Year',
};

export async function generateStaticParams() {
  const today = new Date();
  const params = [];

  for (let i = -1; i < 7 * 4; i++) {
    const d = subDays(today, i);
    params.push({ view: 'day', date: format(d, 'yyyy-MM-dd') });
  }

  for (let i = 0; i < 5; i++) {
    const d = subMonths(today, i);
    params.push({ view: 'month', date: format(d, 'yyyy-MM') });
  }

  for (let i = 0; i < 2; i++) {
    const d = subYears(today, i);
    params.push({ view: 'year', date: format(d, 'yyyy') });
  }

  return params;
}

export const dynamicParams = true;

export default async function ElectricityViewPage({ params }: Props) {
  const { view: viewParam, date: dateParam } = await params;

  const view = VIEW_MAP[viewParam.toLowerCase()];
  if (!view) notFound();

  let selectedDate: Date;
  try {
    let parseStr = dateParam;
    if (view === 'Month') parseStr = `${dateParam}-01`;
    else if (view === 'Year') parseStr = `${dateParam}-01-01`;

    selectedDate = parseISO(parseStr);
    if (!isValid(selectedDate)) throw new Error('Invalid date');
  } catch {
    notFound();
  }

  const now = new Date();
  let chartData: PricePoint[] = [];

  if (view === 'Day') {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    chartData = await getHourlyPrices(start, end);
  } else if (view === 'Month') {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    chartData = await getDailyPrices(start, end);
  } else if (view === 'Year') {
    const start = startOfYear(selectedDate);
    const end = endOfYear(selectedDate);
    chartData = await getMonthlyPrices(start, end);
  }

  return (
    <div className="container mx-auto px-0 py-4 sm:px-4 sm:py-10">
      <div className="flex flex-col gap-4 sm:gap-8">
        <ElectricityPrice
          key={`${viewParam}-${dateParam}`}
          initialData={chartData}
          view={view}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
