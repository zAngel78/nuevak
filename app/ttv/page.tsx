"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";

export default function TimeToValue() {
  // Only onboarding accounts
  const onboardingAccounts = accounts.filter((acc) => acc.isOnboarding);

  // Calculate Fresh Average Days to TTV
  const freshAccounts = onboardingAccounts.filter((acc) => acc.product === "Fresh QMS");
  const freshTTV =
    freshAccounts.length > 0
      ? freshAccounts.reduce((sum, acc) => {
          const start = new Date(acc.startDate).getTime();
          const validation = new Date(acc.validationDate).getTime();
          return sum + (validation - start) / (1000 * 60 * 60 * 24);
        }, 0) / freshAccounts.length
      : 0;

  // Calculate Migrated Average Days to TTV
  const migratedAccounts = onboardingAccounts.filter((acc) => acc.product === "Migrated QMS");
  const migratedTTV =
    migratedAccounts.length > 0
      ? migratedAccounts.reduce((sum, acc) => {
          const start = new Date(acc.startDate).getTime();
          const validation = new Date(acc.validationDate).getTime();
          return sum + (validation - start) / (1000 * 60 * 60 * 24);
        }, 0) / migratedAccounts.length
      : 0;

  // TTV Details by Account (onboarding only)
  const ttvDetails = onboardingAccounts.map((acc) => {
    const start = new Date(acc.startDate).getTime();
    const validation = new Date(acc.validationDate).getTime();
    const days = ((validation - start) / (1000 * 60 * 60 * 24)).toFixed(1);
    return {
      name: acc.name,
      product: acc.product,
      startDate: acc.startDate,
      validationDate: acc.validationDate,
      days,
      guru: acc.guru,
    };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time to Value (TTV)</h1>
        <p className="text-gray-500 mt-1">Average days from start to validation (Onboarding Accounts Only)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KpiCard
          title="Fresh QMS TTV"
          value={freshTTV.toFixed(1)}
          subtitle="days average"
          trend="down"
        />
        <KpiCard
          title="Migrated QMS TTV"
          value={migratedTTV.toFixed(1)}
          subtitle="days average"
        />
        <KpiCard
          title="Total Onboarding Accounts"
          value={onboardingAccounts.length}
          subtitle="accounts tracked"
        />
      </div>

      {/* TTV Details Table */}
      <DataTable
        title="TTV Details by Account (Onboarding)"
        columns={[
          { header: "Account", accessor: "name" },
          { header: "Product", accessor: "product" },
          { header: "Start Date", accessor: "startDate" },
          { header: "Validation Date", accessor: "validationDate" },
          {
            header: "Days to TTV",
            accessor: "days",
            cell: (value) => `${value} days`,
          },
          { header: "Onboarding Guru", accessor: "guru" },
        ]}
        data={ttvDetails}
        maxHeight="600px"
      />
    </div>
  );
}
