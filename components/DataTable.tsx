"use client";

import { useState } from "react";

interface Column {
  header: string;
  accessor: string;
  cell?: (value: any, row?: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  maxHeight?: string;
  searchable?: boolean;
  exportable?: boolean;
}

export default function DataTable({
  title,
  columns,
  data,
  maxHeight = "400px",
  searchable = true,
  exportable = true
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Search filter
  const filteredData = searchTerm
    ? data.filter((row) =>
        columns.some((column) => {
          const value = row[column.accessor];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Sorting
  const sortedData = [...filteredData];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = aVal?.toString().toLowerCase() || "";
      const bStr = bVal?.toString().toLowerCase() || "";

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (accessor: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== accessor) {
        return { key: accessor, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key: accessor, direction: "desc" };
      }
      return null;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map((col) => col.header).join(",");
    const rows = sortedData.map((row) =>
      columns.map((col) => {
        const value = row[col.accessor];
        // Handle values with commas
        const strValue = value?.toString() || "";
        return strValue.includes(",") ? `"${strValue}"` : strValue;
      }).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <div className="flex gap-3 items-center">
            {searchable && (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {exportable && (
              <button
                onClick={exportToCSV}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight }}>
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(column.accessor)}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortConfig?.key === column.accessor && (
                      <span className="text-blue-600">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? "No results found" : "No data available"}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {column.cell ? column.cell(row[column.accessor], row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        Showing {sortedData.length} of {data.length} records
      </div>
    </div>
  );
}
