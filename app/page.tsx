"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import ChartSection from "@/components/ChartSection";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Overview() {
  // New Customers (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newCustomers = accounts.filter(
    (acc) => new Date(acc.createdAt) >= sevenDaysAgo
  );

  // Active Onboarding
  const activeOnboarding = accounts.filter((acc) => acc.status === "Open");

  // Total ARR
  const totalARR = accounts.reduce((sum, acc) => sum + acc.arr, 0);

  // At Risk Accounts
  const atRiskAccounts = accounts.filter(
    (acc) => acc.status === "At Risk" || acc.riskNotes.length > 0
  );

  // ARR by Guru
  const arrByGuru = accounts.reduce((acc, account) => {
    if (!acc[account.guru]) {
      acc[account.guru] = 0;
    }
    acc[account.guru] += account.arr;
    return acc;
  }, {} as Record<string, number>);

  const guruData = Object.entries(arrByGuru).map(([guru, arr]) => ({
    guru,
    arr,
  }));

  // ARR by Product
  const arrByProduct = accounts.reduce((acc, account) => {
    if (!acc[account.product]) {
      acc[account.product] = 0;
    }
    acc[account.product] += account.arr;
    return acc;
  }, {} as Record<string, number>);

  const productData = Object.entries(arrByProduct).map(([product, arr]) => ({
    name: product,
    value: arr,
  }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">General metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total ARR"
          value={`$${totalARR.toLocaleString()}`}
          subtitle="Annual Recurring Revenue"
          trend="up"
        />
        <KpiCard
          title="Active Accounts"
          value={activeOnboarding.length}
          subtitle="Currently onboarding"
        />
        <KpiCard
          title="New Customers"
          value={newCustomers.length}
          subtitle="Last 7 days"
          trend="up"
        />
        <KpiCard
          title="At Risk"
          value={atRiskAccounts.length}
          subtitle="Accounts need attention"
          trend="down"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection title="ARR by Guru" subtitle="Total ARR per Customer Success Guru">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={guruData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="guru" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="arr" fill="#3b82f6" name="ARR" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="ARR by Product" subtitle="Revenue distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>
    </div>
  );
}
