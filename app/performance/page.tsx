"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";
import ChartSection from "@/components/ChartSection";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Performance() {
  // CSAT by Guru Trend
  const csatData = [
    { month: "January", Stacey: 4.2, Ana: 3.8, Carlos: 4.4 },
    { month: "February", Stacey: 4.3, Ana: 3.5, Carlos: 4.5 },
    { month: "March", Stacey: 4.5, Ana: 3.2, Carlos: 4.6 },
  ];

  // Average CSAT by Guru
  const csatByGuru = accounts.reduce((acc, account) => {
    if (!acc[account.guru]) {
      acc[account.guru] = { total: 0, count: 0 };
    }
    acc[account.guru].total += account.csat;
    acc[account.guru].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const guruPerformance = Object.entries(csatByGuru).map(([guru, data]) => ({
    guru,
    avgCSAT: (data.total / data.count).toFixed(2),
    accounts: data.count,
  }));

  // Overall CSAT
  const overallCSAT = (
    accounts.reduce((sum, acc) => sum + acc.csat, 0) / accounts.length
  ).toFixed(2);

  // Accounts by CSAT Range
  const excellent = accounts.filter((acc) => acc.csat >= 4.5).length;
  const good = accounts.filter((acc) => acc.csat >= 4.0 && acc.csat < 4.5).length;
  const average = accounts.filter((acc) => acc.csat >= 3.5 && acc.csat < 4.0).length;
  const poor = accounts.filter((acc) => acc.csat < 3.5).length;

  const csatDistribution = [
    { range: "Excellent (4.5+)", count: excellent },
    { range: "Good (4.0-4.5)", count: good },
    { range: "Average (3.5-4.0)", count: average },
    { range: "Poor (<3.5)", count: poor },
  ];

  // Top Performers
  const topAccounts = [...accounts]
    .sort((a, b) => b.csat - a.csat)
    .slice(0, 5)
    .map((acc) => ({
      name: acc.name,
      csat: acc.csat.toFixed(1),
      product: acc.product,
      guru: acc.guru,
      arr: acc.arr,
    }));

  // Bottom Performers
  const bottomAccounts = [...accounts]
    .sort((a, b) => a.csat - b.csat)
    .slice(0, 5)
    .map((acc) => ({
      name: acc.name,
      csat: acc.csat.toFixed(1),
      product: acc.product,
      guru: acc.guru,
      arr: acc.arr,
    }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance & CSAT</h1>
        <p className="text-gray-500 mt-1">Customer satisfaction metrics and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Overall CSAT"
          value={overallCSAT}
          subtitle="Average score"
          trend="up"
        />
        <KpiCard
          title="Excellent Ratings"
          value={excellent}
          subtitle="4.5+ CSAT score"
          trend="up"
        />
        <KpiCard
          title="Good Ratings"
          value={good}
          subtitle="4.0-4.5 CSAT score"
        />
        <KpiCard
          title="Need Improvement"
          value={poor}
          subtitle="< 3.5 CSAT score"
          trend="down"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSection title="CSAT Trend by Guru" subtitle="Monthly average scores">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={csatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Stacey" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Ana" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="Carlos" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="CSAT Distribution" subtitle="Accounts by rating range">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={csatDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Accounts" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DataTable
          title="Top 5 Performing Accounts"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "CSAT", accessor: "csat" },
            { header: "Product", accessor: "product" },
            { header: "Guru", accessor: "guru" },
          ]}
          data={topAccounts}
        />

        <DataTable
          title="Bottom 5 Performing Accounts"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "CSAT", accessor: "csat" },
            { header: "Product", accessor: "product" },
            { header: "Guru", accessor: "guru" },
          ]}
          data={bottomAccounts}
        />
      </div>

      {/* Guru Performance Table */}
      <DataTable
        title="Guru Performance Summary"
        columns={[
          { header: "Guru", accessor: "guru" },
          { header: "Average CSAT", accessor: "avgCSAT" },
          { header: "Number of Accounts", accessor: "accounts" },
        ]}
        data={guruPerformance}
      />
    </div>
  );
}
