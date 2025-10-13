interface RiskBadgeProps {
  level: "critical" | "high" | "medium" | "low" | "none";
  size?: "sm" | "md" | "lg";
}

export default function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const configs = {
    critical: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
      label: "Critical",
      icon: "🔴"
    },
    high: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-300",
      label: "High Risk",
      icon: "🟠"
    },
    medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
      label: "Medium",
      icon: "🟡"
    },
    low: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
      label: "Low Risk",
      icon: "🔵"
    },
    none: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
      label: "On Track",
      icon: "🟢"
    }
  };

  const config = configs[level];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
