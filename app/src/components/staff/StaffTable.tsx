"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffForm } from "./StaffForm";
import type { Staff } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  BARISTA: "Barista",
};

type Props = {
  staff: Staff[];
  onRefresh: () => void;
};

export function StaffTable({ staff, onRefresh }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this staff member?")) return;
    setDeletingId(id);
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    setDeletingId(null);
    onRefresh();
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-xl">
        No staff added yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">
              <Link href={`/staff/${s.id}`} className="hover:underline text-amber-700">
                {s.name}
              </Link>
            </TableCell>
            <TableCell>{ROLE_LABEL[s.role]}</TableCell>
            <TableCell className="text-muted-foreground">{s.phone ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(s.joinedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {s.status === "ACTIVE" ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <StaffForm staff={s} onSuccess={onRefresh} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deletingId === s.id}
                  onClick={() => handleDelete(s.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
