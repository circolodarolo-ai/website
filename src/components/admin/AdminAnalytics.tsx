'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Globe, Monitor, MousePointer, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AnalyticsRow {
  id: string;
  date?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  month?: string;
  year?: number;
  totalVisits: number;
  uniqueVisitors: number;
  avgSessionDuration?: number;
  avgDailyVisits?: number;
  growthRate?: number;
  bestDayOfWeek?: string;
  bestHourOfDay?: number | null;
  bestMonth?: string;
  overallTrend?: string;
  pageViews?: string | null;
  topPages?: string | null;
  productViews?: string | null;
  conversionData?: string | null;
  hourlyBreakdown?: string | null;
  topProducts?: string | null;
  conversionInsights?: string | null;
  priceInsights?: string | null;
  productInsights?: string | null;
  avgWeeklyVisits?: number;
  avgMonthlyVisits?: number;
}

interface HourlyRow {
  hour: number;
  visits: number;
  label: string;
}

interface AnalyticsEventRow {
  id: string;
  sessionId: string;
  eventType: string;
  pageUrl: string;
  productId: string | null;
  duration: number | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  timestamp: string;
}

type RangeType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'events';

const RANGE_LABELS: Record<RangeType, string> = {
  hourly: 'Orario',
  daily: 'Giornaliero',
  weekly: 'Settimanale',
  monthly: 'Mensile',
  yearly: 'Annuale',
  events: 'Log Eventi',
};

export default function AdminAnalytics() {
  const [range, setRange] = useState<RangeType>('daily');
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyRow[]>([]);
  const [hourlyMeta, setHourlyMeta] = useState<{ date: string; totalVisits: number; peakHour: number } | null>(null);
  const [events, setEvents] = useState<AnalyticsEventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        range,
        page: page.toString(),
        limit: '50',
      });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/admin/analytics?${params}`);
      const json = await res.json();

      if (range === 'events') {
        setEvents(json.data || []);
      } else if (range === 'hourly') {
        setHourlyData(json.data || []);
        setHourlyMeta(json.meta || null);
        setTotal(json.data?.length || 0);
      } else {
        setData(json.data || []);
      }
      setTotal(json.total || 0);
    } catch {
      console.error('Analytics fetch error');
    }
    setLoading(false);
  }, [range, page, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / 50);
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };
  const fmtDateTime = (d: string) => {
    try { return new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  // Summary stats from daily data
  const totalVisits = range === 'hourly'
    ? hourlyData.reduce((s, r) => s + r.visits, 0)
    : data.reduce((s, r) => s + (r.totalVisits || 0), 0);
  const totalUnique = data.reduce((s, r) => s + (r.uniqueVisitors || 0), 0);
  const peakHourVisits = hourlyData.length > 0 ? Math.max(...hourlyData.map(h => h.visits)) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6" /> Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Monitor className="h-4 w-4" /> Visite Totali
          </div>
          <p className="text-2xl font-bold">{totalVisits.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Globe className="h-4 w-4" /> Visitatori Unici
          </div>
          <p className="text-2xl font-bold">{totalUnique.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <MousePointer className="h-4 w-4" /> Eventi Registrati
          </div>
          <p className="text-2xl font-bold">{total.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp className="h-4 w-4" /> Periodo
          </div>
          <p className="text-2xl font-bold">{RANGE_LABELS[range]}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Periodo</Label>
          <Select value={range} onValueChange={(v) => { setRange(v as RangeType); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Orario</SelectItem>
              <SelectItem value="daily">Giornaliero</SelectItem>
              <SelectItem value="weekly">Settimanale</SelectItem>
              <SelectItem value="monthly">Mensile</SelectItem>
              <SelectItem value="yearly">Annuale</SelectItem>
              <SelectItem value="events">Log Eventi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(range === 'hourly' || range !== 'yearly') && (
          <>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Da</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">A</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
            </div>
          </>
        )}
        <Button variant="outline" onClick={fetchData}>
          <Calendar className="h-4 w-4 mr-1" /> Aggiorna
        </Button>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>Caricamento dati...</p>
        </div>
      ) : range === 'hourly' ? (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fascia Oraria</TableHead>
                  <TableHead className="text-right">Visite</TableHead>
                  <TableHead className="text-right">Percentuale</TableHead>
                  <TableHead>Distribuzione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hourlyData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">Nessun dato orario disponibile</TableCell></TableRow>
                ) : hourlyData.map((h) => (
                  <TableRow key={h.hour} className={h.hour === hourlyMeta?.peakHour && h.visits > 0 ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{h.label}</TableCell>
                    <TableCell className="text-right font-semibold">{h.visits.toLocaleString('it-IT')}</TableCell>
                    <TableCell className="text-right text-sm">
                      {totalVisits > 0 ? ((h.visits / totalVisits) * 100).toFixed(1) : '0.0'}%
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-red-600 transition-all"
                          style={{ width: `${peakHourVisits > 0 ? (h.visits / peakHourVisits) * 100 : 0}%` }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {hourlyMeta && (
            <div className="px-5 py-3 bg-gray-50 border-t text-sm text-gray-600">
              Dati del {hourlyMeta.date} — Totale visite: <strong>{hourlyMeta.totalVisits}</strong> —
              Ora di punta: <strong>{hourlyMeta.peakHour.toString().padStart(2, '0')}:00</strong>
            </div>
          )}
        </div>
      ) : range === 'events' ? (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pagina</TableHead>
                  <TableHead>Prodotto</TableHead>
                  <TableHead>Durata</TableHead>
                  <TableHead>Paese</TableHead>
                  <TableHead>Citta</TableHead>
                  <TableHead>Sessione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">Nessun evento registrato</TableCell></TableRow>
                ) : events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm whitespace-nowrap">{fmtDateTime(e.timestamp)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{e.eventType}</Badge></TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{e.pageUrl}</TableCell>
                    <TableCell className="text-sm">{e.productId || '-'}</TableCell>
                    <TableCell className="text-sm">{e.duration ? `${e.duration}s` : '-'}</TableCell>
                    <TableCell className="text-sm">{e.country || '-'}</TableCell>
                    <TableCell className="text-sm">{e.city || '-'}</TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">{e.sessionId.slice(0, 8)}...</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-right">Visite</TableHead>
                  <TableHead className="text-right">Visitatori Unici</TableHead>
                  {range === 'daily' && <TableHead className="text-right">Durata Media</TableHead>}
                  {(range === 'monthly' || range === 'weekly') && <TableHead className="text-right">Media Giornaliera</TableHead>}
                  {range === 'weekly' && <TableHead>Miglior Giorno</TableHead>}
                  {range === 'monthly' && <TableHead>Media Settimanale</TableHead>}
                  {range === 'yearly' && <TableHead>Media Mensile</TableHead>}
                  {range === 'yearly' && <TableHead>Miglior Mese</TableHead>}
                  {range === 'monthly' && <TableHead className="text-right">Crescita</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">Nessun dato disponibile per questo periodo</TableCell></TableRow>
                ) : data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.date && fmtDate(row.date)}
                      {row.weekStartDate && `${fmtDate(row.weekStartDate)} - ${fmtDate(row.weekEndDate || '')}`}
                      {row.month && `${row.month} ${row.year}`}
                      {!row.date && !row.weekStartDate && !row.month && row.year?.toString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{row.totalVisits.toLocaleString('it-IT')}</TableCell>
                    <TableCell className="text-right">{row.uniqueVisitors.toLocaleString('it-IT')}</TableCell>
                    {range === 'daily' && (
                      <TableCell className="text-right">
                        {row.avgSessionDuration ? `${Math.floor(row.avgSessionDuration / 60)}m ${row.avgSessionDuration % 60}s` : '-'}
                      </TableCell>
                    )}
                    {(range === 'monthly' || range === 'weekly') && (
                      <TableCell className="text-right">{row.avgDailyVisits?.toFixed(1) || '-'}</TableCell>
                    )}
                    {range === 'weekly' && <TableCell className="text-sm">{row.bestDayOfWeek || '-'}</TableCell>}
                    {range === 'monthly' && <TableCell className="text-right">{row.avgWeeklyVisits?.toFixed(1) || '-'}</TableCell>}
                    {range === 'yearly' && <TableCell className="text-right">{row.avgMonthlyVisits?.toFixed(1) || '-'}</TableCell>}
                    {range === 'yearly' && <TableCell className="text-sm">{row.bestMonth || '-'}</TableCell>}
                    {range === 'monthly' && (
                      <TableCell className="text-right">
                        {row.growthRate !== undefined && row.growthRate !== 0 ? (
                          <span className={row.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                            {row.growthRate > 0 ? '+' : ''}{row.growthRate.toFixed(1)}%
                          </span>
                        ) : '-'}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Precedente</Button>
          <span className="text-sm text-gray-500">Pagina {page} di {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Successiva</Button>
        </div>
      )}
    </div>
  );
}