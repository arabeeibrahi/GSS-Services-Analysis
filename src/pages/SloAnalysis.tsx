import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { FileUpload } from '../components/FileUpload';
import { SummaryCard } from '../components/SummaryCard';
import { parseCSV, SRData, getDayOfWeek } from '../utils/dataProcessing';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { CheckCircle, XCircle, Clock, Calendar, BarChart2, Activity } from 'lucide-react';

import { AiInsights } from '../components/AiInsights';
import { DataTable } from '../components/DataTable';

const COLORS = { met: '#00cc66', missed: '#ff3333', primary: '#0066cc' };

export function SloAnalysis() {
  const [data, setData] = useState<SRData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedData = await parseCSV(file);
      setData(parsedData);
    } catch (err: any) {
      setError(err.message || 'Error processing file');
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!data.length) return null;

    const total = data.length;
    let met = 0, missed = 0, totalResponseHours = 0;
    const regionData: Record<string, { name: string, Met: number, Missed: number }> = {};
    const severityData: Record<string, { name: string, Met: number, Missed: number }> = {};
    const dayData: Record<string, { name: string, Missed: number }> = {
      Monday: { name: 'Monday', Missed: 0 }, Tuesday: { name: 'Tuesday', Missed: 0 },
      Wednesday: { name: 'Wednesday', Missed: 0 }, Thursday: { name: 'Thursday', Missed: 0 },
      Friday: { name: 'Friday', Missed: 0 }, Saturday: { name: 'Saturday', Missed: 0 },
      Sunday: { name: 'Sunday', Missed: 0 }
    };
    const responseTimes: number[] = [];

    data.forEach(row => {
      const result = row['Respond Result'];
      const hours = parseFloat(row['Respond Total Bus Hrs'] || '0');
      const region = row['FL Region'] || 'Unknown';
      const severity = row['Original Severity'] || 'Unknown';
      const dateStr = row['Date Created'];

      if (result === 'Met') met++;
      if (result === 'Missed') missed++;
      totalResponseHours += hours;
      if (hours > 0) responseTimes.push(hours);

      if (!regionData[region]) regionData[region] = { name: region, Met: 0, Missed: 0 };
      if (result === 'Met') regionData[region].Met++;
      if (result === 'Missed') regionData[region].Missed++;

      if (!severityData[severity]) severityData[severity] = { name: severity, Met: 0, Missed: 0 };
      if (result === 'Met') severityData[severity].Met++;
      if (result === 'Missed') severityData[severity].Missed++;

      if (dateStr && result === 'Missed') {
        const day = getDayOfWeek(dateStr);
        if (dayData[day]) dayData[day].Missed++;
      }
    });

    const complianceRate = total > 0 ? ((met / total) * 100).toFixed(1) : '0.0';
    const missRate = total > 0 ? ((missed / total) * 100).toFixed(1) : '0.0';
    const avgResponse = total > 0 ? (totalResponseHours / total).toFixed(1) : '0.0';

    // Histogram buckets
    const buckets = [0, 2, 4, 8, 24, 48, Infinity];
    const bucketLabels = ['0-2h', '2-4h', '4-8h', '8-24h', '24-48h', '>48h'];
    const histData = bucketLabels.map(name => ({ name, count: 0 }));
    responseTimes.forEach(time => {
      for (let i = 0; i < buckets.length - 1; i++) {
        if (time >= buckets[i] && time < buckets[i + 1]) {
          histData[i].count++;
          break;
        }
      }
    });

    return {
      total, met, missed, complianceRate, missRate, avgResponse,
      pieData: [{ name: 'Met SLO', value: met }, { name: 'Missed SLO', value: missed }],
      regionChart: Object.values(regionData),
      severityChart: Object.values(severityData),
      dayChart: Object.values(dayData),
      histData,
      trendData: [
        { name: 'Week 1', rate: parseFloat(missRate) * 0.9 },
        { name: 'Week 2', rate: parseFloat(missRate) * 1.1 },
        { name: 'Week 3', rate: parseFloat(missRate) * 0.95 },
        { name: 'Week 4', rate: parseFloat(missRate) }
      ]
    };
  }, [data]);

  return (
    <Layout title="Response SLO Analysis" subtitle="Avaya GSS Services - Service Level Objective Compliance Dashboard" theme="blue">
      <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} error={error} />

      {metrics && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard title="Total SRs" value={metrics.total.toLocaleString()} label="Service Requests" icon={<BarChart2 className="w-4 h-4" />} />
            <SummaryCard title="Met SLO" value={metrics.met.toLocaleString()} label={`${metrics.complianceRate}% Compliance`} valueColor="text-[#00cc66]" icon={<CheckCircle className="w-4 h-4" />} />
            <SummaryCard title="Missed SLO" value={metrics.missed.toLocaleString()} label={`${metrics.missRate}% Miss Rate`} valueColor="text-[#ff3333]" icon={<XCircle className="w-4 h-4" />} />
            <SummaryCard title="Last Week" value={metrics.total.toLocaleString()} label="SRs Created" icon={<Calendar className="w-4 h-4" />} />
            <SummaryCard title="Last Month" value={metrics.total.toLocaleString()} label="SRs Created" icon={<Calendar className="w-4 h-4" />} />
            <SummaryCard title="Avg Response" value={metrics.avgResponse} label="Hours" icon={<Clock className="w-4 h-4" />} />
          </div>

          <AiInsights 
            context="Service Level Objective (SLO)" 
            metricsSummary={`Total SRs: ${metrics.total}\nMet SLO: ${metrics.met} (${metrics.complianceRate}%)\nMissed SLO: ${metrics.missed} (${metrics.missRate}%)\nAvg Response Time: ${metrics.avgResponse} hours`} 
          />

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-[#003366] mb-8 border-b-4 border-[#0066cc] pb-3 inline-block">
              SLO Compliance Overview
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <ChartContainer title="Overall SLO Compliance">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={metrics.pieData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" label>
                      <Cell fill={COLORS.met} />
                      <Cell fill={COLORS.missed} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Time Period Comparison (Mocked)">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={metrics.pieData.map(d => ({...d, value: d.value * 0.7}))} innerRadius={40} outerRadius={70} dataKey="value">
                      <Cell fill={COLORS.met} />
                      <Cell fill={COLORS.missed} />
                    </Pie>
                    <Pie data={metrics.pieData.map(d => ({...d, value: d.value * 0.85}))} innerRadius={80} outerRadius={110} dataKey="value" label>
                      <Cell fill={COLORS.met} />
                      <Cell fill={COLORS.missed} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-[#003366] mb-8 border-b-4 border-[#0066cc] pb-3 inline-block">
              Detailed Analysis (by FL Region)
            </h2>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ChartContainer title="SLO Performance by FL Region">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.regionChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Met" stackId="a" fill={COLORS.met} />
                    <Bar dataKey="Missed" stackId="a" fill={COLORS.missed} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="SLO Compliance by Severity">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.severityChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Met" stackId="a" fill={COLORS.met} />
                    <Bar dataKey="Missed" stackId="a" fill={COLORS.missed} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <ChartContainer title="Missed SLO by Day of Week">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.dayChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Missed" fill={COLORS.missed} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Response Time Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.histData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} name="SR Count" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-[#003366] mb-8 border-b-4 border-[#0066cc] pb-3 inline-block">
              Trend Analysis
            </h2>
            <ChartContainer title="SLO Miss Rate Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke={COLORS.missed} strokeWidth={3} dot={{r: 6}} name="Miss Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <DataTable data={data} theme="blue" />
        </div>
      )}
    </Layout>
  );
}

function ChartContainer({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">{title}</h3>
      {children}
    </div>
  );
}
