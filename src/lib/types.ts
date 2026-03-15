export interface PriceData {
  timestamp: Date;
  /** Price in c/kWh */
  price: number | null;
  /** Price with VAT in c/kWh */
  priceVat: number | null;
}
