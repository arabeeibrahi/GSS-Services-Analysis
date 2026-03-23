import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { FileUpload } from '../components/FileUpload';
import { SummaryCard } from '../components/SummaryCard';
import { parseCSV, SRData, getDayOfWeek, getWeekLabel } from '../utils/dataProcessing';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { CheckCircle, XCircle, Clock, Calendar, BarChart2, AlertTriangle } from 'lucide-react';

import { AiInsights } from '../components/AiInsights';
import { DataTable } from '../components/DataTable';

const COLORS = { assigned: '#00cc66', unassigned: '#ff9933', delayed: '#ff3333', primary: '#0066cc' };

export function AssignmentAnalysis() {
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
    let assigned = 0, totalAssignmentHours = 0, delayed = 0;
    const assignmentHours: number[] = [];
    
    const severityTimeData: Record<string, { total: number, count: number }> = {};
    const delayedByRegionData: Record<string, number> = {};
    const delayedByWeekData: Record<string, number> = {};
    const delayedHeatmapData: Record<string, Record<string, number>> = {};
    
    const regionData: Record<string, { name: string, Assigned: number, Unassigned: number }> = {};
    const severityData: Record<string, { name: string, Assigned: number, Unassigned: number }> = {};
    const dayData: Record<string, { name: string, count: number }> = {
      Monday: { name: 'Monday', count: 0 }, Tuesday: { name: 'Tuesday', count: 0 },
      Wednesday: { name: 'Wednesday', count: 0 }, Thursday: { name: 'Thursday', count: 0 },
      Friday: { name: 'Friday', count: 0 }, Saturday: { name: 'Saturday', count: 0 },
      Sunday: { name: 'Sunday', count: 0 }
    };
    const productData: Record<string, { name: string, Assigned: number, Unassigned: number }> = {};

    data.forEach(row => {
      const isAssigned = row['Responded By'] && row['Responded By'] !== 'Unknown';
      const hours = parseFloat(row['Respond Total Bus Hrs'] || '0');
      const region = row['FL Region'] || 'Unknown';
      const severity = row['Original Severity'] || 'Unknown';
      const dateStr = row['Date Created'];
      const product = row['Product Name'] || 'Unknown';

      if (isAssigned) {
        assigned++;
        if (hours > 0) {
          totalAssignmentHours += hours;
          assignmentHours.push(hours);
          if (hours > 4) delayed++;
          
          if (!severityTimeData[severity]) severityTimeData[severity] = { total: 0, count: 0 };
          severityTimeData[severity].total += hours;
          severityTimeData[severity].count++;
        }
      }

      if (hours > 4 && dateStr) {
        delayedByRegionData[region] = (delayedByRegionData[region] || 0) + 1;
        const weekLabel = getWeekLabel(dateStr);
        delayedByWeekData[weekLabel] = (delayedByWeekData[weekLabel] || 0) + 1;
        
        if (!delayedHeatmapData[region]) delayedHeatmapData[region] = {};
        delayedHeatmapData[region][weekLabel] = (delayedHeatmapData[region][weekLabel] || 0) + 1;
      }

      if (!regionData[region]) regionData[region] = { name: region, Assigned: 0, Unassigned: 0 };
      if (isAssigned) regionData[region].Assigned++; else regionData[region].Unassigned++;

      if (!severityData[severity]) severityData[severity] = { name: severity, Assigned: 0, Unassigned: 0 };
      if (isAssigned) severityData[severity].Assigned++; else severityData[severity].Unassigned++;

      if (dateStr) {
        const day = getDayOfWeek(dateStr);
        if (dayData[day]) dayData[day].count++;
      }

      if (!productData[product]) productData[product] = { name: product, Assigned: 0, Unassigned: 0 };
      if (isAssigned) productData[product].Assigned++; else productData[product].Unassigned++;
    });

    const assignmentRate = total > 0 ? ((assigned / total) * 100).toFixed(1) : '0.0';
    const unassignedRate = total > 0 ? ((100 - parseFloat(assignmentRate))).toFixed(1) : '0.0';
    const avgAssignment = assigned > 0 ? (totalAssignmentHours / assigned).toFixed(1) : '0.0';
    const delayedRate = total > 0 ? ((delayed / total) * 100).toFixed(1) : '0.0';
    
    const sortedHours = [...assignmentHours].sort((a, b) => a - b);
    const medianAssignment = sortedHours.length > 0 ? sortedHours[Math.floor(sortedHours.length / 2)].toFixed(1) : '0.0';

    // Histogram buckets
    const buckets = [0, 1, 2, 4, 8, 24, Infinity];
    const bucketLabels = ['0-1h', '1-2h', '2-4h', '4-8h', '8-24h', '>24h'];
    const histData = bucketLabels.map(name => ({ name, count: 0 }));
    assignmentHours.forEach(time => {
      for (let i = 0; i < buckets.length - 1; i++) {
        if (time >= buckets[i] && time < buckets[i + 1]) {
          histData[i].count++;
          break;
        }
      }
    });

    const severityAvgData = Object.keys(severityTimeData).map(key => ({
      name: key,
      avg: parseFloat((severityTimeData[key].total / severityTimeData[key].count).toFixed(2))
    }));

    const delayedRegionChart = Object.keys(delayedByRegionData).map(key => ({
      name: key,
      count: delayedByRegionData[key]
    }));

    const delayedWeekChart = Object.keys(delayedByWeekData).sort().map(key => ({
      name: key,
      count: delayedByWeekData[key]
    }));

    // Heatmap preparation
    const heatmapRegions = Object.keys(delayedHeatmapData);
    const heatmapWeeks = [...new Set(Object.values(delayedHeatmapData).flatMap(d => Object.keys(d)))].sort();

    const productChart = Object.values(productData)
      .sort((a, b) => (b.Assigned + b.Unassigned) - (a.Assigned + a.Unassigned))
      .slice(0, 10);

    return {
      total, assigned, unassigned: total - assigned, assignmentRate, unassignedRate, avgAssignment, delayed, delayedRate, medianAssignment,
      pieData: [{ name: 'Assigned', value: assigned }, { name: 'Unassigned', value: total - assigned }],
      histData,
      severityAvgData,
      delayedRegionChart,
      delayedWeekChart,
      heatmapRegions,
      heatmapWeeks,
      delayedHeatmapData,
      regionChart: Object.values(regionData),
      severityChart: Object.values(severityData),
      dayChart: Object.values(dayData),
      productChart,
      trendData: [
        { name: 'Week 1', rate: parseFloat(assignmentRate) * 0.95 },
        { name: 'Week 2', rate: parseFloat(assignmentRate) * 1.02 },
        { name: 'Week 3', rate: parseFloat(assignmentRate) * 0.98 },
        { name: 'Week 4', rate: parseFloat(assignmentRate) }
      ]
    };
  }, [data]);

  return (
    <Layout title="Assignment Analysis" subtitle="Avaya GSS Services - SR Assignment Performance Dashboard" theme="green">
      <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} error={error} />

      {metrics && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard title="Total SRs" value={metrics.total.toLocaleString()} label="Service Requests" icon={<BarChart2 className="w-4 h-4" />} />
            <SummaryCard title="Assigned" value={metrics.assigned.toLocaleString()} label={`${metrics.assignmentRate}% Rate`} valueColor="text-[#00cc66]" icon={<CheckCircle className="w-4 h-4" />} />
            <SummaryCard title="Unassigned" value={metrics.unassigned.toLocaleString()} label={`${metrics.unassignedRate}% Unassigned`} valueColor="text-[#ff9933]" icon={<XCircle className="w-4 h-4" />} />
            <SummaryCard title="Avg Assignment" value={metrics.avgAssignment} label="Hours" icon={<Clock className="w-4 h-4" />} />
            <SummaryCard title="Delayed" value={metrics.delayed.toLocaleString()} label={`${metrics.delayedRate}% (>4hrs)`} valueColor="text-[#ff3333]" icon={<AlertTriangle className="w-4 h-4" />} />
            <SummaryCard title="Median Time" value={metrics.medianAssignment} label="Hours" icon={<Clock className="w-4 h-4" />} />
          </div>

          <AiInsights 
            context="Service Request Assignment" 
            metricsSummary={`Total SRs: ${metrics.total}\nAssigned: ${metrics.assigned} (${metrics.assignmentRate}%)\nUnassigned: ${metrics.unassigned} (${metrics.unassignedRate}%)\nAvg Assignment Time: ${metrics.avgAssignment} hours\nDelayed (>4hrs): ${metrics.delayed} (${metrics.delayedRate}%)\nMedian Time: ${metrics.medianAssignment} hours`} 
          />

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-[#006633] mb-8 border-b-4 border-[#009966] pb-3 inline-block">
              Assignment Overview
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <ChartContainer title="Assignment Status">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={metrics.pieData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" label>
                      <Cell fill={COLORS.assigned} />
                      <Cell fill={COLORS.unassigned} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Assignment Time Distribution">
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
            <h2 className="text-2xl font-bold text-[#006633] mb-8 border-b-4 border-[#009966] pb-3 inline-block">
              Delayed Assignment Patterns
            </h2>
            <div className="bg-gradient-to-r from-red-500 to-red-400 text-white p-6 rounded-xl mb-8 shadow-md">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><AlertTriangle /> Delay Pattern Analysis</h3>
              <p className="text-red-50">This section shows delayed assignment patterns ({'>'}4 hours) broken down by FL Region and Week patterns to identify trends and areas for improvement.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ChartContainer title="Delayed Assignments by FL Region">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.delayedRegionChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.delayed} name="Delayed Count" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Delayed Assignments by Week Pattern">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.delayedWeekChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke={COLORS.delayed} strokeWidth={3} dot={{r: 6}} name="Delayed Count" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <ChartContainer title="Delayed Assignment Heatmap: FL Region × Week Pattern">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 border border-gray-200">Region</th>
                      {metrics.heatmapWeeks.map(week => (
                        <th key={week} className="px-6 py-3 border border-gray-200 text-center">{week}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.heatmapRegions.map(region => (
                      <tr key={region} className="bg-white">
                        <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">{region}</td>
                        {metrics.heatmapWeeks.map(week => {
                          const val = metrics.delayedHeatmapData[region]?.[week] || 0;
                          const values = Object.values(metrics.delayedHeatmapData[region] || {}) as number[];
                          const maxVal = values.length > 0 ? Math.max(...values) : 0;
                          const intensity = maxVal > 0 ? val / maxVal : 0;
                          return (
                            <td 
                              key={`${region}-${week}`} 
                              className="px-6 py-4 border border-gray-200 text-center font-bold"
                              style={{
                                backgroundColor: val > 0 ? `rgba(255, 51, 51, ${intensity * 0.8 + 0.1})` : 'transparent',
                                color: val > 0 && intensity > 0.5 ? 'white' : 'inherit'
                              }}
                            >
                              {val > 0 ? val : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartContainer>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-[#006633] mb-8 border-b-4 border-[#009966] pb-3 inline-block">
              Detailed Analysis
            </h2>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ChartContainer title="Assignment by FL Region">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.regionChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Assigned" stackId="a" fill={COLORS.assigned} />
                    <Bar dataKey="Unassigned" stackId="a" fill={COLORS.unassigned} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Assignment by Severity">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.severityChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Assigned" stackId="a" fill={COLORS.assigned} />
                    <Bar dataKey="Unassigned" stackId="a" fill={COLORS.unassigned} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <ChartContainer title="Assignments by Day of Week">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.dayChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#009966" name="Assignments" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Assignment by Product (Top 10)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.productChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Assigned" stackId="a" fill={COLORS.assigned} />
                    <Bar dataKey="Unassigned" stackId="a" fill={COLORS.unassigned} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <DataTable data={data} theme="green" />
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
