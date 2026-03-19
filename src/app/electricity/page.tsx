import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export const revalidate = 600;

export default function ElectricityRedirect() {
  const today = format(new Date(), 'yyyy-MM-dd');
  redirect(`/electricity/day/${today}`);
}
