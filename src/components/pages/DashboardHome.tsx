import { useEffect, useState } from 'react';
import useDataUpdate from '@/utils/useDataUpdate';
import Link from 'next/link';
import dayjs from 'dayjs';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Line, Legend, ComposedChart } from 'recharts';

import {
  Calendar as CalendarIcon,
  MapPin,
  Package,
  Phone,
  Plus,
  ReceiptText,
  Settings as SettingsIcon,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import type { Transaction, Product, Client } from '@/types';
import { getTransactions } from '@/utils/transactionStorage';
import { getProducts } from '@/utils/productStorage';
import { getClients } from '@/utils/clientStorage';
import { getSettings } from '@/utils/settingsStorage';

export default function DashboardHome() {
  const t = useTranslations('dashboard');
  const itemTypeT = useTranslations('itemType');
  const refresh = useDataUpdate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rangeMode, setRangeMode] = useState<'month' | 'year' | 'custom' | '7days' | '30days'>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const { theme, currency, distanceUnit } = getSettings();
  const currentDate = dayjs();

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());
    setClients(getClients());
  }, [refresh]);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Nieznany klient';

  const getTravelKm = (tx: Transaction): number =>
    tx.items
      .map(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod &&
          prod.name?.toLowerCase() === itemTypeT('travel').toLowerCase() &&
          prod.unit === 'km' &&
          item.quantity > 0
          ? item.quantity
          : 0;
      })
      .reduce((sum, val) => sum + val, 0);
  const sortedTransactions = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  const filteredTransactions = transactions.filter(tx => {
    const txDate = dayjs(tx.date);
    switch (rangeMode) {
      case 'month':
        return txDate.month() === currentDate.month() && txDate.year() === currentDate.year();
      case 'year':
        return txDate.isAfter(currentDate.subtract(1, 'year'));
      case '7days':
        return txDate.isAfter(currentDate.subtract(7, 'day'));
      case '30days':
        return txDate.isAfter(currentDate.subtract(30, 'day'));
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return (
            txDate.isAfter(dayjs(customRange.from).subtract(1, 'day')) &&
            txDate.isBefore(dayjs(customRange.to).add(1, 'day'))
          );
        }
        return true;
      default:
        return true;
    }
  });

  const dailyData = filteredTransactions.reduce(
    (acc, tx) => {
      const date = dayjs(tx.date).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          travel: 0,
          value: 0,
          clients: new Set<string>(),
        };
      }
      acc[date].count += 1;
      acc[date].travel += getTravelKm(tx);
      acc[date].value += tx.totalPrice;
      acc[date].clients.add(tx.clientId);
      acc[date].value = parseFloat(acc[date].value.toFixed(2));
      return acc;
    },
    {} as Record<
      string,
      {
        date: string;
        count: number;
        travel: number;
        value: number;
        clients: Set<string>;
      }
    >
  );

  const maxCount = Math.max(...Object.values(dailyData).map(d => d.count), 1);

  const calendarModifiers = Object.values(dailyData).reduce((acc, day) => {
    const intensity = Math.min(4, Math.ceil((day.count / maxCount) * 4));
    const key = `calendar-intensity-${intensity}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(new Date(day.date));
    return acc;
  }, {} as Record<string, Date[]>);

  const lastClients = clients.slice(-3).reverse();
  const lastTransactions = sortedTransactions.slice(-3).reverse();

  const totalSummary = {
    transactions: filteredTransactions.length,
    value: filteredTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0),
    travel: filteredTransactions.reduce((sum, tx) => sum + getTravelKm(tx), 0),
  };

  return (
    <div className='relative z-0 py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-10'>
      {/* Dashboard Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3 mt-4"
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-amber-300 to-yellow-400 dark:from-lime-300 dark:via-yellow-300 dark:to-amber-400 animate-text-glow drop-shadow-md">
          {t('title')}
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4'
      >
        <Link href='/products'>
          <Button variant='outline' className='w-full gap-2 text-sm px-4 py-2 hover:shadow-md'>
            <Package size={16} />
            {t('buttons.products')}
          </Button>
        </Link>
        <Link href='/clients/new'>
          <Button variant='outline' className='w-full gap-2 text-sm px-4 py-2 hover:shadow-md'>
            <Users size={16} />
            {t('buttons.addClient')}
          </Button>
        </Link>
        <Link href='/settings'>
          <Button variant='outline' className='w-full gap-2 text-sm px-4 py-2 hover:shadow-md'>
            <SettingsIcon size={16} />
            {t('buttons.settings')}
          </Button>
        </Link>
        <Link href='/transactions/new'>
          <Button className='w-full gap-2 text-sm px-4 py-2 font-bold bg-green-600 hover:bg-green-700 text-white'>
            <Plus size={16} />
            {t('buttons.newTransaction')}
          </Button>
        </Link>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='grid grid-cols-2 md:grid-cols-4 gap-6'
      >
        {[
          {
            title: t('summary.travel'),
            value: totalSummary.travel,
            unit: distanceUnit,
            icon: <MapPin className='w-5 h-5 text-green-500' />,
          },
          {
            title: t('summary.transactions'),
            value: totalSummary.transactions,
            unit: '',
            icon: <ReceiptText className='w-5 h-5 text-indigo-500' />,
          },
          {
            title: t('summary.totalValue'),
            value: totalSummary.value.toFixed(2),
            unit: currency,
            icon: <ReceiptText className='w-5 h-5 text-blue-500' />,
          },
          {
            title: t('summary.avgPerTransaction'),
            value: (totalSummary.value / Math.max(1, totalSummary.transactions)).toFixed(2),
            unit: currency,
            icon: <CalendarIcon className='w-5 h-5 text-pink-500' />,
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className='rounded-2xl p-4 backdrop-blur-xs bg-white/10 dark:bg-slate-800/30 border border-white/10 shadow-xl transition-all'
          >
            <div className='flex items-center justify-between mb-2'>
              <div className='text-sm font-medium text-foreground flex items-center gap-2'>
                {item.icon}
                {item.title}
              </div>
            </div>
            <div className='text-3xl font-bold text-foreground mt-1'>
              <CountUp end={parseInt(item.value.toString())} duration={1.4} separator=' ' />
              {` ${item.unit}`}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Transactions & Clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6'
      >
        {/* Transactions Card */}
        <motion.div layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Card className='border border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl transition-all duration-300 backdrop-blur-xs'>
            <Link href='/transactions'>
              <CardHeader>
                <CardTitle className='flex items-center gap-4 text-foreground'>
                  <ReceiptText className='w-6 h-6 text-green-600 dark:text-green-400' />
                  <h2 className='text-lg font-semibold tracking-tight dark:drop-shadow'>{t('summary.transactions')}</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-6 px-6'>
                <ul className='text-sm space-y-1'>
                  {lastTransactions.map(tx => (
                    <li key={tx.id} className='flex justify-between items-center'>
                      <div className='grid grid-cols-3 items-center gap-4 w-full'>
                        <div className='text-sm text-muted-foreground'>
                          {new Date(tx.date).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className='text-sm'>
                          <span className='font-medium'>{getClientName(tx.clientId)}</span>
                        </div>
                        <div className='text-sm font-medium text-right'>
                          <span className='text-sm font-bold text-green-700 dark:text-green-400'>
                            {tx.totalPrice.toFixed(2)} zł
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        {/* Clients Card */}
        <motion.div layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Card className='border border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl transition-all duration-300 backdrop-blur-xs'>
            <Link href='/clients'>
              <CardHeader>
                <CardTitle className='flex items-center gap-4 text-foreground'>
                  <Users className='w-6 h-6 text-indigo-500 dark:text-indigo-300' />
                  <h2 className='text-lg font-semibold tracking-tight dark:drop-shadow'>{t('summary.clients')}</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-6 px-6'>
                <ul className='text-sm space-y-1'>
                  {lastClients.map(client => (
                    <li key={client.id} className='flex justify-between items-center text-sm'>
                      <div className='font-medium'>{client.name}</div>
                      <div className='flex flex-wrap gap-2 text-muted-foreground justify-end'>
                        {client.address && (
                          <span className='flex items-center gap-1'>
                            <MapPin className='w-4 h-4' />
                            {client.address}
                          </span>
                        )}
                        {client.phone && (
                          <span className='flex items-center gap-1'>
                            <Phone className='w-4 h-4' />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      </motion.div>

      {/* Range Selector & Custom Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className='grid grid-cols-1 lg:grid-cols-1 max-w-xs mx-auto'
      >
        <Select value={rangeMode} onValueChange={(value: 'month' | 'year' | 'custom' | '7days' | '30days') => setRangeMode(value)}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('range.select')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='month'>{t('range.month')}</SelectItem>
            <SelectItem value='7days'>{t('range.7days')}</SelectItem>
            <SelectItem value='30days'>{t('range.30days')}</SelectItem>
            <SelectItem value='year'>{t('range.year')}</SelectItem>
            <SelectItem value='custom'>{t('range.custom')}</SelectItem>
          </SelectContent>
        </Select>

        {rangeMode === 'custom' && (
          <div className='mt-4'>
            <Calendar
              mode='range'
              selected={customRange}
              onSelect={setCustomRange}
              numberOfMonths={1}
              className='rounded-lg border shadow-md p-4 backdrop-blur-xs'
              modifiers={calendarModifiers}
              modifiersClassNames={{
                weekend: 'bg-blue-100',
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Chart + Calendar Visualizations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className='grid grid-cols-1 lg:grid-cols-7 gap-6'
      >
        {/* ComposedChart: Value vs Travel */}
        <div className='col-span-7 lg:col-span-3'>
          <Card className='border border-white/10 bg-white/5 dark:bg-slate-800/30 shadow-xl backdrop-blur-xs'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>{t('charts.valueVsDistance')}</CardTitle>
            </CardHeader>
            <CardContent className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={Object.values(dailyData)}>
                  <XAxis dataKey='date' stroke='#ccc' tick={{ fontSize: 10 }} />
                  <YAxis
                    yAxisId='left'
                    stroke='#ccc'
                    label={{
                      value: `${t('summary.totalValue')}`,
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    stroke='#ccc'
                    label={{
                      value: `${t('summary.travel')} (${distanceUnit})`,
                      angle: -90,
                      position: 'insideRight',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12,
                    }}
                    labelStyle={{
                      fontSize: 12,
                      color: theme === 'dark' ? '#d1d5db' : '#374151',
                    }}
                  />
                  <Legend />
                  <Bar yAxisId='left' dataKey='value' fill='#4ade80' name={`${t('summary.totalValue')} (${currency})`} />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='travel'
                    stroke='#60a5fa'
                    strokeWidth={2}
                    name={`${t('summary.travel')} (${distanceUnit})`}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Clients per Day & Calendar Overview */}
        <div className='col-span-7 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* BarChart: Daily Clients Count */}
          <Card className='border border-white/10 bg-white/5 dark:bg-slate-800/30 shadow-xl backdrop-blur-xs'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>{t('charts.dailyClients')}</CardTitle>
            </CardHeader>
            <CardContent className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={Object.values(dailyData)}>
                  <XAxis dataKey='date' tick={{ fontSize: 10 }} stroke='#ccc' />
                  <YAxis stroke='#ccc' width={20} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12,
                    }}
                    labelStyle={{
                      fontSize: 12,
                      color: theme === 'dark' ? '#d1d5db' : '#374151',
                    }}
                    formatter={val => [`${val}`, t('summary.clients')]}
                    cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.2 }}
                  />
                  <Bar dataKey='count' fill='#22c55e' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calendar Overview */}
          <motion.div layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link href='/transactions/calendar'>
              <Card className='border border-white/10 bg-white/5 dark:bg-slate-800/30 shadow-xl backdrop-blur-xs'>
                <CardHeader>
                  <CardTitle>{t('charts.calendar')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode='default'
                    selected={undefined}
                    modifiers={calendarModifiers}
                    modifiersClassNames={{
                      'calendar-intensity-1': 'bg-green-100',
                      'calendar-intensity-2': 'bg-green-300',
                      'calendar-intensity-3': 'bg-green-500 text-white',
                      'calendar-intensity-4': 'bg-green-700 text-white font-bold',
                    }}
                  />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <Link href='/transactions/new'>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 z-50 transition'
          aria-label='Add new transaction'
        >
          <Plus className='w-6 h-6' />
        </motion.button>
      </Link>
    </div>
  );
}
