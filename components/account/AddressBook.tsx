"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { Address } from "@/lib/account/addresses";
import { removeAddress } from "@/lib/account/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressForm } from "./AddressForm";

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{address.label}</span>
                {address.isDefault ? <Badge variant="outline">Default</Badge> : null}
              </div>
              <button
                type="button"
                onClick={() => removeAddress(address.id)}
                className="text-muted hover:text-danger"
                aria-label={`Remove ${address.label} address`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <address className="mt-2 text-sm not-italic text-muted">
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}, {address.postcode}
              <br />
              {address.country}
            </address>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="rounded-lg border border-border p-5">
          <AddressForm onDone={() => setShowForm(false)} />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add new address
        </Button>
      )}
    </div>
  );
}
