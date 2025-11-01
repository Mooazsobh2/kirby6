import React, { useState } from "react";

export default function HRView() {
  const [employees] = useState([
    { id: "EMP-001", name: "أحمد علي", role: "فني صيانة", status: "نشط" },
    { id: "EMP-002", name: "خالد محمد", role: "مندوب مبيعات", status: "إجازة" },
    { id: "EMP-003", name: "روان سالم", role: "فني تركيبات", status: "نشط" },
  ]);

  return (
    <div className="space-y-6">
      <div title="إدارة الموظفين" >
        <div className="rounded-2xl border bg-white overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-500">
                <th className="py-2 pr-4">الموظف</th>
                <th className="py-2">الوظيفة</th>
                <th className="py-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t">
                  <td className="py-2 pr-4">{emp.name}</td>
                  <td>{emp.role}</td>
                  <td className={emp.status === "نشط" ? "text-green-700" : "text-amber-700"}>
                    {emp.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
