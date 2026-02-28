"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const nativeSelect =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

type LeaveRequest = {
  id: string;
  type: "SICK" | "ANNUAL" | "EMERGENCY" | "OTHER";
  startDate: string;
  endDate: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  SICK: "Sick Leave",
  ANNUAL: "Annual Leave",
  EMERGENCY: "Emergency",
  OTHER: "Other",
};

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

function daysBetween(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(diff / 86400000) + 1;
}

export function LeaveTab({ staffId }: { staffId: string }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/staff/${staffId}/leave`);
    setRequests(await res.json());
    setLoading(false);
  }, [staffId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/staff/${staffId}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setOpen(false);
    setForm({ type: "ANNUAL", startDate: "", endDate: "", reason: "" });
    fetchRequests();
  }

  async function handleStatus(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/leave/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this leave request?")) return;
    await fetch(`/api/leave/${id}`, { method: "DELETE" });
    fetchRequests();
  }

  const pending = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
          {pending > 0 && <span className="ml-2 text-yellow-600">· {pending} pending</span>}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ Request Leave</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  className={nativeSelect}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Reason (optional)</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Brief reason..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Submit"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-xl">No leave requests yet.</div>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => {
            const cfg = STATUS_CONFIG[r.status];
            const days = daysBetween(r.startDate, r.endDate);
            return (
              <div key={r.id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{TYPE_LABEL[r.type]}</span>
                    <Badge className={cfg.className}>{cfg.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(r.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    {" — "}
                    {new Date(r.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    <span className="ml-2 font-medium text-foreground">{days} day{days !== 1 ? "s" : ""}</span>
                  </p>
                  {r.reason && <p className="text-sm text-muted-foreground italic">"{r.reason}"</p>}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {r.status === "PENDING" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatus(r.id, "APPROVED")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatus(r.id, "REJECTED")}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
