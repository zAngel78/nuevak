"use client";

import { accounts } from "@/lib/mockData";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";

export default function TimeToValue() {
  // Calculate Fresh Average Days to TTV
  const freshAccounts = accounts.filter((acc) => acc.product === "Fresh QMS");
  const freshTTV =
    freshAccounts.reduce((sum, acc) => {
      const start = new Date(acc.startDate).getTime();
      const validation = new Date(acc.validationDate).getTime();
      return sum + (validation - start) / (1000 * 60 * 60 * 24);
    }, 0) / freshAccounts.length;

  // Calculate Migrated Average Days to TTV
  const migratedAccounts = accounts.filter((acc) => acc.product === "Migrated QMS");
  const migratedTTV =
    migratedAccounts.reduce((sum, acc) => {
      const start = new Date(acc.startDate).getTime();
      const validation = new Date(acc.validationDate).getTime();
      return sum + (validation - start) / (1000 * 60 * 60 * 24);
    }, 0) / migratedAccounts.length;

  // Calculate Enterprise Average Days to TTV
  const enterpriseAccounts = accounts.filter((acc) => acc.product === "Enterprise QMS");
  const enterpriseTTV =
    enterpriseAccounts.reduce((sum, acc) => {
      const start = new Date(acc.startDate).getTime();
      const validation = new Date(acc.validationDate).getTime();
      return sum + (validation - start) / (1000 * 60 * 60 * 24);
    }, 0) / enterpriseAccounts.length;

  // Overall TTV
  const overallTTV =
    accounts.reduce((sum, acc) => {
      const start = new Date(acc.startDate).getTime();
      const validation = new Date(acc.validationDate).getTime();
      return sum + (validation - start) / (1000 * 60 * 60 * 24);
    }, 0) / accounts.length;

  // TTV Details by Account
  const ttvDetails = accounts.map((acc) => {
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
        <p className="text-gray-500 mt-1">Average days from start to validation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Overall Average TTV"
          value={overallTTV.toFixed(1)}
          subtitle="days average"
        />
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
          title="Enterprise QMS TTV"
          value={enterpriseTTV.toFixed(1)}
          subtitle="days average"
          trend="up"
        />
      </div>

      {/* TTV Details Table */}
      <DataTable
        title="TTV Details by Account"
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
          { header: "Guru", accessor: "guru" },
        ]}
        data={ttvDetails}
        maxHeight="600px"
      />
    </div>
  );
}
