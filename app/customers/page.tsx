"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";

export default function Customers() {
  // Only onboarding accounts
  const onboardingAccounts = accounts.filter((acc) => acc.isOnboarding);

  // New Onboarding Customers (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newCustomers = onboardingAccounts.filter(
    (acc) => new Date(acc.createdAt) >= sevenDaysAgo
  );

  // Active Onboarding
  const activeOnboarding = onboardingAccounts.filter((acc) => acc.status === "Open");

  // At Risk = Journey Status "Stuck"
  const atRiskAccounts = onboardingAccounts.filter((acc) => acc.journeyStatus === "Stuck");

  const riskData = atRiskAccounts.map((acc) => ({
    name: acc.name,
    arr: acc.arr,
    product: acc.product,
    guru: acc.guru,
    notes: acc.riskNotes.slice(0, 3).join(", "),
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Customers</h1>
        <p className="text-gray-500 mt-1">Onboarding accounts dashboard (Onboarding Guru view)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Onboarding"
          value={onboardingAccounts.length}
          subtitle="Accounts in onboarding"
        />
        <KpiCard
          title="New Onboarding"
          value={newCustomers.length}
          subtitle="Last 7 days"
          trend="up"
        />
        <KpiCard
          title="Active Onboarding"
          value={activeOnboarding.length}
          subtitle="Currently onboarding"
        />
        <KpiCard
          title="Stuck (At Risk)"
          value={atRiskAccounts.length}
          subtitle="Journey Status: Stuck"
          trend="down"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <DataTable
          title="New Onboarding Customers (Last 7 Days)"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Product", accessor: "product" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Created Date", accessor: "createdAt" },
            { header: "Onboarding Guru", accessor: "guru" },
          ]}
          data={newCustomers}
        />

        <DataTable
          title="Active Onboarding"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Product", accessor: "product" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Start Date", accessor: "startDate" },
            { header: "Onboarding Guru", accessor: "guru" },
            {
              header: "CSAT",
              accessor: "csat",
              cell: (value) => `${value.toFixed(1)}`,
            },
          ]}
          data={activeOnboarding}
        />

        <DataTable
          title="Stuck Accounts (At Risk)"
          columns={[
            { header: "Account", accessor: "name" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Product", accessor: "product" },
            { header: "Onboarding Guru", accessor: "guru" },
            { header: "Risk Notes", accessor: "notes" },
          ]}
          data={riskData}
        />
      </div>
    </div>
  );
}
