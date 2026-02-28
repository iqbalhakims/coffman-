"use client";

import { useCallback, useEffect, useState } from "react";
import { StaffTable } from "@/components/staff/StaffTable";
import { StaffForm } from "@/components/staff/StaffForm";
import type { Staff } from "@/lib/types";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/staff");
    setStaff(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const activeCount = staff.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-sm text-muted-foreground">
            {staff.length} member{staff.length !== 1 ? "s" : ""}
            {staff.length > 0 && (
              <span className="ml-2">· {activeCount} active</span>
            )}
          </p>
        </div>
        <StaffForm onSuccess={fetchStaff} />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : (
        <StaffTable staff={staff} onRefresh={fetchStaff} />
      )}
    </div>
  );
}
