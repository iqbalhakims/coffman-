"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Staff } from "@/lib/types";

type Props = {
  staff?: Staff;
  onSuccess: () => void;
};

const nativeSelect =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

export function StaffForm({ staff, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: staff?.name ?? "",
    email: (staff as (typeof staff & { email?: string }))?.email ?? "",
    password: "",
    role: staff?.role ?? "BARISTA",
    status: staff?.status ?? "ACTIVE",
    phone: staff?.phone ?? "",
    joinedAt: staff?.joinedAt
      ? new Date(staff.joinedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  const isEdit = !!staff;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/staff/${staff.id}` : "/api/staff";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setOpen(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"}>
          {isEdit ? "Edit" : "Add Staff"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Staff" : "Add Staff"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Budi Santoso"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. budi@coffman.com"
              required={!isEdit}
            />
          </div>
          <div className="space-y-1">
            <Label>{isEdit ? "New Password" : "Password"}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={isEdit ? "Leave blank to keep current" : "Set a password"}
              required={!isEdit}
            />
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <select
              className={nativeSelect}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
            >
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="BARISTA">Barista</option>
            </select>
          </div>
          {isEdit && (
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                className={nativeSelect}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 08123456789"
            />
          </div>
          <div className="space-y-1">
            <Label>Join Date</Label>
            <Input
              type="date"
              value={form.joinedAt}
              onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
