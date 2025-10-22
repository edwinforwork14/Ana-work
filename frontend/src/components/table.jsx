import * as React from "react";

export function Table({ children, className }) {
  return (
    <div className={`w-full overflow-auto ${className || ""}`}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead className="border-b border-gray-700">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-800">{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="hover:bg-gray-800">{children}</tr>;
}

export function TableHead({ children, className }) {
  return (
    <th
      className={`text-left text-gray-300 font-semibold px-4 py-2 ${className || ""}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={`px-4 py-2 text-gray-200 ${className || ""}`}>{children}</td>
  );
}