"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import ChartSection from "@/components/ChartSection";
import DataTable from "@/components/DataTable";
import RiskBadge from "@/components/RiskBadge";
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
import { useState } from "react";

export default function Overview() {
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "quarter">("week");

  // ONLY Onboarding accounts
  const onboardingAccounts = accounts.filter((acc) => acc.isOnboarding);

  // Complete Onboarding accounts
  const completeOnboarding = accounts.filter((acc) => acc.journeyStatus === "Complete");

  // Filter complete onboarding by time period
  const getDateThreshold = () => {
    const now = new Date();
    if (timeFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo;
    } else {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(now.getMonth() - 3);
      return quarterAgo;
    }
  };

  const completeOnboardingFiltered = completeOnboarding.filter(
    (acc) => acc.completedDate && new Date(acc.completedDate) >= getDateThreshold()
  );

  // Active Onboarding
  const activeOnboarding = onboardingAccounts.filter((acc) => acc.status === "Open");

  // Total ARR from onboarding accounts only
  const totalARR = onboardingAccounts.reduce((sum, acc) => sum + acc.arr, 0);

  // At Risk = Journey Status "Stuck"
  const atRiskAccounts = onboardingAccounts.filter((acc) => acc.journeyStatus === "Stuck");

  // ARR by Guru (onboarding only)
  const arrByGuru = onboardingAccounts.reduce((acc, account) => {
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

  // Guru by Products count
  const guruByProducts = onboardingAccounts.reduce((acc, account) => {
    const key = `${account.guru}-${account.product}`;
    if (!acc[key]) {
      acc[key] = { guru: account.guru, product: account.product, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { guru: string; product: string; count: number }>);

  const guruProductData = Object.values(guruByProducts);

  // Implementation Type count and total ARR
  const implementationType = onboardingAccounts.reduce((acc, account) => {
    if (!acc[account.implementationType]) {
      acc[account.implementationType] = { count: 0, arr: 0 };
    }
    acc[account.implementationType].count += 1;
    acc[account.implementationType].arr += account.arr;
    return acc;
  }, {} as Record<string, { count: number; arr: number }>);

  const implementationData = Object.entries(implementationType).map(([type, data]) => ({
    type,
    count: data.count,
    arr: data.arr,
  }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">General metrics and insights (Onboarding Accounts Only)</p>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as "week" | "month" | "quarter")}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total ARR (Onboarding)"
          value={`$${totalARR.toLocaleString()}`}
          subtitle="Onboarding accounts only"
          trend="up"
        />
        <KpiCard
          title="Active Onboarding"
          value={activeOnboarding.length}
          subtitle="Currently onboarding"
        />
        <KpiCard
          title="Complete Onboarding"
          value={completeOnboardingFiltered.length}
          subtitle={`This ${timeFilter}`}
          trend="up"
        />
        <KpiCard
          title="Stuck (At Risk)"
          value={atRiskAccounts.length}
          subtitle="Journey Status: Stuck"
          trend="down"
        />
      </div>

      {/* Alert Banner if there are critical accounts */}
      {atRiskAccounts.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-semibold text-red-900">
                {atRiskAccounts.length} Account{atRiskAccounts.length > 1 ? 's' : ''} Require Immediate Attention
              </h3>
              <p className="text-sm text-red-700">Journey status is stuck. Review alerts page for details.</p>
            </div>
          </div>
          <a
            href="/alerts"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            View Alerts
          </a>
        </div>
      )}

      {/* Complete Onboarding List */}
      <div className="mb-8">
        <DataTable
          title={`Complete Onboarding Accounts (${timeFilter})`}
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Product", accessor: "product" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Onboarding Guru", accessor: "guru" },
            { header: "Completed Date", accessor: "completedDate" },
          ]}
          data={completeOnboardingFiltered}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSection title="ARR by Onboarding Guru" subtitle="Total ARR per Onboarding Guru">
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

        <ChartSection title="Guru by Products" subtitle="Account count by Guru and Product">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Guru</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {guruProductData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">{item.guru}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{item.product}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 font-medium">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartSection>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection title="Implementation Type - Count" subtitle="Accounts by Implementation Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={implementationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Account Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Implementation Type - Total ARR" subtitle="ARR distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={implementationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, arr }) => `${type}: $${arr.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="arr"
              >
                {implementationData.map((entry, index) => (
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
