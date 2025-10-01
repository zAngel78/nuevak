interface ChartSectionProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}

export default function ChartSection({ title, children, subtitle }: ChartSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
