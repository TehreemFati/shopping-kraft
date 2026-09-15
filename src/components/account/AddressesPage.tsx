"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAddress, deleteAddress } from "@/lib/actions/auth";
import { toast } from "sonner";
import type { Address } from "@/types/database";

export function AddressesPage({ addresses }: { addresses: Address[] }) {
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAddress(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Address saved");
        e.currentTarget.reset();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
      toast.success("Address removed");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-muted-foreground">No saved addresses.</p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between rounded-md border p-4"
              >
                <div>
                  {addr.label && <p className="font-medium">{addr.label}</p>}
                  <p className="text-sm">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm">{addr.line2}</p>}
                  <p className="text-sm">
                    {addr.city}, {addr.province} {addr.postal_code}
                  </p>
                  {addr.is_default && (
                    <span className="text-xs text-primary">Default</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(addr.id)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid max-w-lg gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" placeholder="Home, Office..." />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" name="line1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" name="province" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" name="postal_code" />
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                Save Address
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
