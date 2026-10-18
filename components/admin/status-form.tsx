"use client";

import { useState } from "react";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";

export function StatusForm({
  id,
  status,
  notes,
}: {
  id: string;
  status: string;
  notes: string | null;
}) {
  const [nextStatus, setNextStatus] = useState(status);
  const [adminNotes, setAdminNotes] = useState(notes ?? "");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, adminNotes }),
    });
    setMessage(response.ok ? "Updated" : "Update failed");
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Status</Label>
          <Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
            {APPLICATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Internal notes</Label>
          <Textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} />
        </div>
        <Button type="submit">Save review</Button>
        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      </form>
    </Card>
  );
}
