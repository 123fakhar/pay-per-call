"use client";

import Link from "next/link";
import { flexRender, stockFeatures, useTable } from "@tanstack/react-table";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  campaigns: string[];
  monthlyRevenueRange: string;
  status: string;
  createdAt: string;
};

export function ApplicationsTable({
  items,
  total,
  page,
  pageSize,
}: {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const table = useTable({
    features: stockFeatures,
    columns: [
      { accessorKey: "createdAt", header: "Submitted" },
      { accessorKey: "name", header: "Applicant" },
      { accessorKey: "companyName", header: "Company" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "id", header: "Open" },
    ],
    data: items.map((item) => ({
      ...item,
      name: `${item.firstName} ${item.lastName}`,
      createdAt: new Date(item.createdAt).toLocaleString(),
    })),
  });

  const campaignCounts = items.reduce<Record<string, number>>((acc, item) => {
    for (const campaign of item.campaigns ?? []) {
      acc[campaign] = (acc[campaign] ?? 0) + 1;
    }
    return acc;
  }, {});
  const chartData = Object.entries(campaignCounts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-8">
      {chartData.length ? (
        <div className="h-56 rounded-sm border border-[var(--line)] p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Campaign selections on this page
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#b7b1a6" />
              <YAxis allowDecimals={false} stroke="#b7b1a6" />
              <Tooltip />
              <Bar dataKey="count" fill="#c4a574" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-sm border border-[var(--line)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--charcoal)] text-left text-[var(--muted)]">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {item.firstName} {item.lastName}
                  <div className="text-[var(--muted)]">{item.email}</div>
                </td>
                <td className="px-4 py-3">{item.companyName}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  <Link className="text-[var(--gold)]" href={`/admin/applications/${item.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[var(--muted)]">
        Page {page} · {items.length} shown · {total} total · page size {pageSize}
      </p>
    </div>
  );
}
