"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaffForm } from "@/components/staff/StaffForm";
import { AttendanceTab } from "@/components/staff/AttendanceTab";
import { LeaveTab } from "@/components/staff/LeaveTab";
import type { Staff } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  BARISTA: "Barista",
};

type Tab = "overview" | "attendance" | "leave";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/staff/${id}`);
    if (!res.ok) { router.push("/staff"); return; }
    setData(await res.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!confirm("Delete this staff member? This will also remove all their attendance and leave records.")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    router.push("/staff");
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  if (!data) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "attendance", label: "Attendance" },
    { key: "leave", label: "Leave" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/staff")}>
          ← Back
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            {data.status === "ACTIVE" ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{ROLE_LABEL[data.role]}</p>
        </div>
        <div className="flex gap-2">
          <StaffForm staff={data} onSuccess={fetchData} />
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-amber-700 text-amber-800"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="border rounded-xl divide-y">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="text-sm font-medium">{data.phone ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Join Date</span>
            <span className="text-sm font-medium">{new Date(data.joinedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium">{ROLE_LABEL[data.role]}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium">{data.status === "ACTIVE" ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Added</span>
            <span className="text-sm font-medium">{new Date(data.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}

      {tab === "attendance" && <AttendanceTab staffId={id} />}
      {tab === "leave" && <LeaveTab staffId={id} />}
    </div>
  );
}
