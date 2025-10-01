"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";

export default function Customers() {
  // New Customers (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newCustomers = accounts.filter(
    (acc) => new Date(acc.createdAt) >= sevenDaysAgo
  );

  // Active Onboarding
  const activeOnboarding = accounts.filter((acc) => acc.status === "Open");

  // At Risk Accounts
  const atRiskAccounts = accounts.filter(
    (acc) => acc.status === "At Risk" || acc.riskNotes.length > 0
  );

  const riskData = atRiskAccounts.map((acc) => ({
    name: acc.name,
    arr: acc.arr,
    product: acc.product,
    guru: acc.guru,
    notes: acc.riskNotes.slice(0, 3).join(", "),
  }));

  // All Active Customers
  const activeCustomers = accounts.filter((acc) => !acc.churned);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">Customer accounts and onboarding status</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Active Customers"
          value={activeCustomers.length}
          subtitle="Non-churned accounts"
        />
        <KpiCard
          title="New Customers"
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
          title="At Risk"
          value={atRiskAccounts.length}
          subtitle="Need attention"
          trend="down"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <DataTable
          title="New Customers (Last 7 Days)"
          columns={[
            { header: "Account", accessor: "name" },
            { header: "Product", accessor: "product" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Created Date", accessor: "createdAt" },
            { header: "Guru", accessor: "guru" },
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
            { header: "Guru", accessor: "guru" },
            {
              header: "CSAT",
              accessor: "csat",
              cell: (value) => `${value.toFixed(1)}`,
            },
          ]}
          data={activeOnboarding}
        />

        <DataTable
          title="At Risk Accounts"
          columns={[
            { header: "Account", accessor: "name" },
            {
              header: "ARR",
              accessor: "arr",
              cell: (value) => `$${value.toLocaleString()}`,
            },
            { header: "Product", accessor: "product" },
            { header: "Guru", accessor: "guru" },
            { header: "Risk Notes", accessor: "notes" },
          ]}
          data={riskData}
        />
      </div>
    </div>
  );
}
