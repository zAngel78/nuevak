"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";

export default function AlertsPage() {
  const onboardingAccounts = accounts.filter((acc) => acc.isOnboarding);

  // Critical: Stuck accounts with negative variance
  const criticalAccounts = onboardingAccounts.filter((acc) => {
    const currentProgress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    const previousProgress = acc.previousWeekProgress || 0;
    const variance = currentProgress - previousProgress;
    return acc.journeyStatus === "Stuck" || variance < -5;
  });

  // High risk: Low progress or multiple risk notes
  const highRiskAccounts = onboardingAccounts.filter((acc) => {
    const progress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    return progress < 30 || acc.riskNotes.length >= 3;
  });

  // Near Go Live: Within 2 weeks
  const nearGoLive = onboardingAccounts.filter((acc) => {
    if (!acc.goLiveDate) return false;
    const goLiveDate = new Date(acc.goLiveDate);
    const today = new Date();
    const daysUntil = Math.ceil((goLiveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 14;
  });

  // Stalled: No progress in last week (variance = 0)
  const stalledAccounts = onboardingAccounts.filter((acc) => {
    const currentProgress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    const previousProgress = acc.previousWeekProgress || 0;
    return currentProgress === previousProgress && currentProgress < 100;
  });

  // Prepare data with risk levels
  const criticalData = criticalAccounts.map((acc) => {
    const currentProgress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    const previousProgress = acc.previousWeekProgress || 0;
    const variance = currentProgress - previousProgress;

    return {
      ...acc,
      progress: currentProgress.toFixed(1),
      variance: variance.toFixed(1),
      riskLevel: "Critical",
      issue: acc.journeyStatus === "Stuck" ? "Journey Stuck" : "Negative Variance"
    };
  });

  const highRiskData = highRiskAccounts.map((acc) => {
    const progress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    return {
      ...acc,
      progress: progress.toFixed(1),
      riskLevel: "High",
      issue: progress < 30 ? "Low Progress" : `${acc.riskNotes.length} Risk Notes`
    };
  });

  const nearGoLiveData = nearGoLive.map((acc) => {
    const goLiveDate = new Date(acc.goLiveDate!);
    const today = new Date();
    const daysUntil = Math.ceil((goLiveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const progress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;

    return {
      ...acc,
      progress: progress.toFixed(1),
      daysUntilGoLive: daysUntil,
      status: progress >= 90 ? "On Track" : progress >= 70 ? "At Risk" : "Critical"
    };
  });

  const stalledData = stalledAccounts.map((acc) => {
    const progress = (acc.tasksCompletedHours / acc.totalTasksHours) * 100;
    return {
      ...acc,
      progress: progress.toFixed(1),
      issue: "No Progress This Week"
    };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
        <p className="text-gray-500 mt-1">Accounts requiring immediate attention</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Critical Alerts"
          value={criticalAccounts.length}
          subtitle="Stuck or declining"
          trend="down"
        />
        <KpiCard
          title="High Risk"
          value={highRiskAccounts.length}
          subtitle="Low progress or multiple risks"
          trend="down"
        />
        <KpiCard
          title="Near Go Live"
          value={nearGoLive.length}
          subtitle="Within 2 weeks"
        />
        <KpiCard
          title="Stalled Projects"
          value={stalledAccounts.length}
          subtitle="No progress this week"
          trend="down"
        />
      </div>

      {/* Critical Accounts */}
      <div className="mb-8">
        <DataTable
          title="🔴 Critical Accounts - Immediate Action Required"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Issue", accessor: "issue" },
            {
              header: "Progress",
              accessor: "progress",
              cell: (value) => (
                <span className="font-medium text-red-600">{value}%</span>
              )
            },
            {
              header: "Variance",
              accessor: "variance",
              cell: (value) => {
                const num = parseFloat(value);
                const color = num < 0 ? "text-red-600" : "text-gray-600";
                return <span className={`font-medium ${color}`}>{num > 0 ? "+" : ""}{value}%</span>;
              }
            },
            { header: "Phase", accessor: "phase" },
            { header: "ARR", accessor: "arr", cell: (value) => `$${value.toLocaleString()}` },
            { header: "Onboarding Guru", accessor: "guru" }
          ]}
          data={criticalData}
          maxHeight="500px"
        />
      </div>

      {/* High Risk Accounts */}
      <div className="mb-8">
        <DataTable
          title="🟠 High Risk Accounts"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Issue", accessor: "issue" },
            {
              header: "Progress",
              accessor: "progress",
              cell: (value) => {
                const num = parseFloat(value);
                const color = num < 30 ? "text-red-600" : num < 50 ? "text-orange-600" : "text-gray-600";
                return <span className={`font-medium ${color}`}>{value}%</span>;
              }
            },
            { header: "Journey Status", accessor: "journeyStatus" },
            { header: "Phase", accessor: "phase" },
            { header: "Product", accessor: "product" },
            { header: "Onboarding Guru", accessor: "guru" }
          ]}
          data={highRiskData}
          maxHeight="500px"
        />
      </div>

      {/* Near Go Live */}
      <div className="mb-8">
        <DataTable
          title="🚀 Near Go Live - Next 2 Weeks"
          columns={[
            { header: "Account", accessor: "name" },
            {
              header: "Days Until Go Live",
              accessor: "daysUntilGoLive",
              cell: (value) => {
                const color = value <= 7 ? "text-red-600" : "text-orange-600";
                return <span className={`font-bold ${color}`}>{value} days</span>;
              }
            },
            { header: "Go Live Date", accessor: "goLiveDate" },
            {
              header: "Progress",
              accessor: "progress",
              cell: (value) => {
                const num = parseFloat(value);
                const color = num >= 90 ? "text-green-600" : num >= 70 ? "text-orange-600" : "text-red-600";
                return <span className={`font-medium ${color}`}>{value}%</span>;
              }
            },
            {
              header: "Status",
              accessor: "status",
              cell: (value) => {
                const bgColor = value === "On Track" ? "bg-green-100 text-green-800" :
                               value === "At Risk" ? "bg-orange-100 text-orange-800" :
                               "bg-red-100 text-red-800";
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>{value}</span>;
              }
            },
            { header: "ARR", accessor: "arr", cell: (value) => `$${value.toLocaleString()}` },
            { header: "Onboarding Guru", accessor: "guru" }
          ]}
          data={nearGoLiveData}
          maxHeight="500px"
        />
      </div>

      {/* Stalled Projects */}
      <div className="mb-8">
        <DataTable
          title="⏸️ Stalled Projects - No Progress This Week"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Issue", accessor: "issue" },
            {
              header: "Progress",
              accessor: "progress",
              cell: (value) => <span className="font-medium text-gray-600">{value}%</span>
            },
            { header: "Phase", accessor: "phase" },
            { header: "Product", accessor: "product" },
            {
              header: "Risk Notes",
              accessor: "riskNotes",
              cell: (value) => value.length > 0 ? value[value.length - 1] : "No notes"
            },
            { header: "Onboarding Guru", accessor: "guru" }
          ]}
          data={stalledData}
          maxHeight="500px"
        />
      </div>

      {/* Action Items Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Recommended Actions</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-bold mr-2">•</span>
            <span><strong>Critical accounts:</strong> Schedule immediate 1-on-1 with Onboarding Guru to unblock issues</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">•</span>
            <span><strong>High risk accounts:</strong> Review resource allocation and identify bottlenecks</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">•</span>
            <span><strong>Near Go Live:</strong> Verify all testing complete and customer ready for launch</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">•</span>
            <span><strong>Stalled projects:</strong> Re-engage with customer to understand blockers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
