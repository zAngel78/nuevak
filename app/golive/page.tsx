"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";
import ChartSection from "@/components/ChartSection";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export default function GoLive() {
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "quarter">("week");
  const [phaseFilter, setPhaseFilter] = useState<string>("All");

  // Only onboarding accounts
  const onboardingAccounts = accounts.filter((acc) => acc.isOnboarding);

  // Calculate implementation progress (weighted by hours)
  const accountsWithProgress = onboardingAccounts.map((acc) => {
    const currentProgress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    const previousProgress = acc.previousWeekProgress || 0;
    const variance = currentProgress - previousProgress;

    return {
      ...acc,
      currentProgress,
      previousProgress,
      variance,
    };
  });

  // Average progress
  const avgProgress =
    accountsWithProgress.reduce((sum, acc) => sum + acc.currentProgress, 0) /
    accountsWithProgress.length;

  // Average variance
  const avgVariance =
    accountsWithProgress.reduce((sum, acc) => sum + acc.variance, 0) /
    accountsWithProgress.length;

  // Filter by milestone date/phase
  const getDateThreshold = () => {
    const now = new Date();
    if (timeFilter === "week") {
      const weekAhead = new Date(now);
      weekAhead.setDate(now.getDate() + 7);
      return weekAhead;
    } else if (timeFilter === "month") {
      const monthAhead = new Date(now);
      monthAhead.setMonth(now.getMonth() + 1);
      return monthAhead;
    } else {
      const quarterAhead = new Date(now);
      quarterAhead.setMonth(now.getMonth() + 3);
      return quarterAhead;
    }
  };

  const filteredByMilestone = onboardingAccounts.filter((acc) => {
    const milestoneDate = new Date(acc.milestoneDate);
    const threshold = getDateThreshold();
    const dateMatch = milestoneDate <= threshold;
    const phaseMatch = phaseFilter === "All" || acc.phase === phaseFilter;
    return dateMatch && phaseMatch;
  });

  // Customers by phase
  const customersByPhase = onboardingAccounts.reduce((acc, account) => {
    if (!acc[account.phase]) {
      acc[account.phase] = 0;
    }
    acc[account.phase] += 1;
    return acc;
  }, {} as Record<string, number>);

  const phaseData = Object.entries(customersByPhase).map(([phase, count]) => ({
    phase,
    count,
  }));

  // Progress chart data
  const progressChartData = accountsWithProgress.map((acc) => ({
    name: acc.name,
    progress: acc.currentProgress.toFixed(1),
    variance: acc.variance.toFixed(1),
  }));

  // Upcoming Go Lives
  const upcomingGoLives = onboardingAccounts
    .filter((acc) => acc.goLiveDate)
    .sort((a, b) => new Date(a.goLiveDate!).getTime() - new Date(b.goLiveDate!).getTime())
    .map((acc) => {
      const currentProgress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
      return {
        name: acc.name,
        goLiveDate: acc.goLiveDate,
        phase: acc.phase,
        progress: currentProgress.toFixed(1),
        guru: acc.guru,
        arr: acc.arr,
      };
    });

  const phases = ["All", "Kickoff", "Planning", "Implementation", "Testing", "Go Live"];

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Go Live Dashboard</h1>
          <p className="text-gray-500 mt-1">Implementation progress and Go Live tracking</p>
        </div>
        <div className="flex gap-3">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {phases.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Avg Implementation Progress"
          value={`${avgProgress.toFixed(1)}%`}
          subtitle="Weighted by hours"
          trend="up"
        />
        <KpiCard
          title="Week-to-Week Variance"
          value={`${avgVariance > 0 ? "+" : ""}${avgVariance.toFixed(1)}%`}
          subtitle="Progress change"
          trend={avgVariance > 0 ? "up" : avgVariance < 0 ? "down" : "neutral"}
        />
        <KpiCard
          title={`Customers by Milestone (${timeFilter})`}
          value={filteredByMilestone.length}
          subtitle={`Phase: ${phaseFilter}`}
        />
        <KpiCard
          title="Upcoming Go Lives"
          value={upcomingGoLives.length}
          subtitle="Total scheduled"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Implementation Progress by Account" subtitle="Current completion % (weighted by hours)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressChartData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="progress" fill="#3b82f6" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Week-to-Week Variance" subtitle="Progress change from previous week">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressChartData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="variance" fill="#8b5cf6" name="Variance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Phase Distribution */}
      <div className="mb-8">
        <ChartSection title="Customers by Journey Phase" subtitle="Total accounts in each phase">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={phaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ec4899" name="Account Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <DataTable
          title={`Customers by Milestone Date (${timeFilter}) & Phase (${phaseFilter})`}
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Product", accessor: "product" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Phase", accessor: "phase" },
            { header: "Milestone Date", accessor: "milestoneDate" },
            { header: "Onboarding Guru", accessor: "guru" },
          ]}
          data={filteredByMilestone}
        />

        <DataTable
          title="Upcoming Go Lives"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Go Live Date", accessor: "goLiveDate" },
            { header: "Phase", accessor: "phase" },
            {
              header: "Progress %",
              accessor: "progress",
              cell: (value) => `${value}%`,
            },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Onboarding Guru", accessor: "guru" },
          ]}
          data={upcomingGoLives}
        />

        <DataTable
          title="Implementation Progress Details (Weighted by Hours)"
          columns={[
            { header: "Account", accessor: "name" },
            {
              header: "Current Progress %",
              accessor: "currentProgress",
              cell: (value) => `${value.toFixed(1)}%`,
            },
            {
              header: "Previous Week %",
              accessor: "previousProgress",
              cell: (value) => `${value.toFixed(1)}%`,
            },
            {
              header: "Variance",
              accessor: "variance",
              cell: (value) => {
                const num = parseFloat(value);
                const color = num > 0 ? "text-green-600" : num < 0 ? "text-red-600" : "text-gray-600";
                return <span className={color}>{num > 0 ? "+" : ""}{value.toFixed(1)}%</span>;
              },
            },
            { header: "Phase", accessor: "phase" },
            { header: "Onboarding Guru", accessor: "guru" },
          ]}
          data={accountsWithProgress}
        />
      </div>
    </div>
  );
}
