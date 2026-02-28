"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type AttendanceRecord = {
  id: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  note: string | null;
};

const STATUS_CONFIG = {
  PRESENT: { label: "Present", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  LATE: { label: "Late", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  HALF_DAY: { label: "Half Day", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  ABSENT: { label: "Absent", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function AttendanceTab({ staffId }: { staffId: string }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ status: "PRESENT", note: "", date: todayISO() });
  const [addLoading, setAddLoading] = useState(false);
  const [clockingOut, setClockingOut] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/staff/${staffId}/attendance`);
    setRecords(await res.json());
    setLoading(false);
  }, [staffId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const todayRecord = records.find(
    (r) => new Date(r.date).toISOString().split("T")[0] === todayISO()
  );

  async function handleClockIn() {
    setAddLoading(true);
    await fetch(`/api/staff/${staffId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PRESENT" }),
    });
    setAddLoading(false);
    fetchRecords();
  }

  async function handleClockOut() {
    if (!todayRecord) return;
    setClockingOut(todayRecord.id);
    await fetch(`/api/attendance/${todayRecord.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeOut: true }),
    });
    setClockingOut(null);
    fetchRecords();
  }

  async function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    await fetch(`/api/staff/${staffId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setAddLoading(false);
    setAddOpen(false);
    setAddForm({ status: "PRESENT", note: "", date: todayISO() });
    fetchRecords();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this attendance record?")) return;
    await fetch(`/api/attendance/${id}`, { method: "DELETE" });
    fetchRecords();
  }

  return (
    <div className="space-y-4">
      {/* Today card */}
      <div className="border rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Today — {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          {todayRecord ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              In: <span className="font-medium text-foreground">{fmt(todayRecord.timeIn)}</span>
              {todayRecord.timeOut && (
                <> · Out: <span className="font-medium text-foreground">{fmt(todayRecord.timeOut)}</span></>
              )}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">Not clocked in yet</p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {!todayRecord && (
            <Button size="sm" onClick={handleClockIn} disabled={addLoading}>
              Clock In
            </Button>
          )}
          {todayRecord && !todayRecord.timeOut && (
            <Button size="sm" variant="outline" onClick={handleClockOut} disabled={!!clockingOut}>
              Clock Out
            </Button>
          )}
          {todayRecord && todayRecord.timeOut && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Done for today</Badge>
          )}

          {/* Manual add */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">+ Manual</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attendance Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddManual} className="space-y-4">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <select
                    className={nativeSelect}
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Note (optional)</Label>
                  <Input
                    value={addForm.note}
                    onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                    placeholder="Any remarks..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addLoading}>{addLoading ? "Saving..." : "Save"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* History */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">History</h3>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-xl">No attendance records yet.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Note</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => {
              const cfg = STATUS_CONFIG[r.status];
              const duration =
                r.timeIn && r.timeOut
                  ? (() => {
                      const mins = Math.round(
                        (new Date(r.timeOut).getTime() - new Date(r.timeIn).getTime()) / 60000
                      );
                      const h = Math.floor(mins / 60);
                      const m = mins % 60;
                      return h > 0 ? `${h}h ${m}m` : `${m}m`;
                    })()
                  : "—";

              return (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">
                    {new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge className={cfg.className}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{fmt(r.timeIn)}</TableCell>
                  <TableCell className="text-sm">{fmt(r.timeOut)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{duration}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.note ?? "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
