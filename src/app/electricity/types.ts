export type PricePoint = {
  timestamp: string; // ISO string
  price: number | null;
  priceVat: number | null;
};

export type ViewType = 'Day' | 'Month' | 'Year';

export type FormattedPoint = {
  timestampKey: number;
  relativeKey: number;
  displayPrice: number | null;
  formattedTime: string;
  interval?: string;
  fullDate: string;
};
