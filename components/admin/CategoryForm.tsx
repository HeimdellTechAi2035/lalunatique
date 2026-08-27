"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createCategory } from "@/lib/admin/products/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Values = { name: string; slug: string; description: string };

export function CategoryForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Values>({
    defaultValues: { name: "", slug: "", description: "" },
  });

  async function onSubmit(values: Values) {
    setError(null);
    const result = await createCategory(values);
    if (!result.ok) {
      setError(result.errors[0]);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="cat-name">Name</Label>
        <Input id="cat-name" {...register("name", { required: true })} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input id="cat-slug" {...register("slug", { required: true })} placeholder="e.g. drops" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="cat-description">Description</Label>
        <Input id="cat-description" className="w-64" {...register("description")} />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        Add category
      </Button>
      {error ? <p className="w-full text-xs text-danger">{error}</p> : null}
    </form>
  );
}
