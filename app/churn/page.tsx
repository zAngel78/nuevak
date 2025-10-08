"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";
import ChartSection from "@/components/ChartSection";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function ChurnAnalysis() {
  // Churned Accounts (this year)
  const churnedAccounts = accounts.filter(
    (acc) => acc.churned && new Date(acc.createdAt).getFullYear() === 2025
  );

  const totalChurnedARR = churnedAccounts.reduce((sum, acc) => sum + acc.arr, 0);

  // Churn Reasons with latest Churn Notes
  const churnReasons = churnedAccounts.map((acc) => ({
    name: acc.name,
    arr: acc.arr,
    product: acc.product,
    latestChurnNote: acc.churnNotes.length > 0 ? acc.churnNotes[acc.churnNotes.length - 1] : "No notes",
    guru: acc.guru,
  }));

  // Stuck accounts with last 3 Risk Notes
  const stuckAccounts = accounts.filter((acc) => acc.journeyStatus === "Stuck");
  const stuckReasons = stuckAccounts.map((acc) => ({
    name: acc.name,
    arr: acc.arr,
    product: acc.product,
    last3RiskNotes: acc.riskNotes.slice(-3).join("; "),
    guru: acc.guru,
  }));

  // Churn Rate
  const totalAccounts = accounts.length;
  const churnRate = ((churnedAccounts.length / totalAccounts) * 100).toFixed(1);

  // Churn by Product
  const churnByProduct = churnedAccounts.reduce((acc, account) => {
    if (!acc[account.product]) {
      acc[account.product] = 0;
    }
    acc[account.product] += 1;
    return acc;
  }, {} as Record<string, number>);

  const churnProductData = Object.entries(churnByProduct).map(([product, count]) => ({
    name: product,
    value: count,
  }));

  // Churn by Guru
  const churnByGuru = churnedAccounts.reduce((acc, account) => {
    if (!acc[account.guru]) {
      acc[account.guru] = 0;
    }
    acc[account.guru] += 1;
    return acc;
  }, {} as Record<string, number>);

  const churnGuruData = Object.entries(churnByGuru).map(([guru, count]) => ({
    name: guru,
    value: count,
  }));

  const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#3b82f6"];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Churn Analysis</h1>
        <p className="text-gray-500 mt-1">Churned accounts and stuck journeys</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KpiCard
          title="Churned Accounts"
          value={churnedAccounts.length}
          subtitle="This year (2025)"
          trend="down"
        />
        <KpiCard
          title="Total Churned ARR"
          value={`$${totalChurnedARR.toLocaleString()}`}
          subtitle="Lost revenue"
          trend="down"
        />
        <KpiCard
          title="Churn Rate"
          value={`${churnRate}%`}
          subtitle="Of total accounts"
          trend="down"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Churn by Product" subtitle="Number of churned accounts">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={churnProductData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {churnProductData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Churn by Onboarding Guru" subtitle="Number of churned accounts">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={churnGuruData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {churnGuruData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Churn Reasons Table */}
      <div className="mb-8">
        <DataTable
          title={`Churn Reasons - Latest Churn Notes (Total ARR: $${totalChurnedARR.toLocaleString()})`}
          columns={[
            { header: "Account", accessor: "name" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Product", accessor: "product" },
            { header: "Onboarding Guru", accessor: "guru" },
            { header: "Latest Churn Note", accessor: "latestChurnNote" },
          ]}
          data={churnReasons}
          maxHeight="600px"
        />
      </div>

      {/* Stuck Reasons Table */}
      <div className="mb-8">
        <DataTable
          title="Reasons for Stuck - Last 3 Risk Notes"
          columns={[
            { header: "Account", accessor: "name" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Product", accessor: "product" },
            { header: "Onboarding Guru", accessor: "guru" },
            { header: "Last 3 Risk Notes", accessor: "last3RiskNotes" },
          ]}
          data={stuckReasons}
          maxHeight="600px"
        />
      </div>
    </div>
  );
}
