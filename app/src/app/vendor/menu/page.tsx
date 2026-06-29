"use client";

import { useState } from "react";
import {
  useVendorMenu,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useToggleAvailability,
  type VendorMenuCategory,
  type VendorMenuItem,
} from "@/hooks/useVendorApi";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { VegDot } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sheet } from "@/components/ui/Sheet";
import { ConfirmDialog } from "@/components/ui/Sheet";
import { PlusIcon, EditIcon, TrashIcon } from "@/components/icons";
import { formatPrice, cn } from "@/utils/format";

export default function VendorMenuPage() {
  const { data: categories, isLoading } = useVendorMenu();
  const toast = useToast();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const toggleAvail = useToggleAvailability();

  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editCat, setEditCat] = useState<VendorMenuCategory | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorMenuItem | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemIsVeg, setItemIsVeg] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const resetItemForm = () => {
    setEditingItem(null);
    setItemName("");
    setItemDesc("");
    setItemPrice("");
    setItemIsVeg(true);
    setItemCategoryId("");
    setShowItemForm(false);
  };

  const openAddItem = (catId: string) => {
    resetItemForm();
    setItemCategoryId(catId);
    setShowItemForm(true);
  };

  const openEditItem = (item: VendorMenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDesc(item.description || "");
    setItemPrice(String(item.price / 100));
    setItemIsVeg(item.isVeg);
    setItemCategoryId(item.categoryId);
    setShowItemForm(true);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newCatName.trim() });
      setNewCatName("");
      setShowAddCat(false);
      toast.success("Category added");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCat) return;
    try {
      await updateCategory.mutateAsync({ id: editCat.id, name: editCat.name });
      setEditCat(null);
      toast.success("Category updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    try {
      await deleteCategory.mutateAsync(deleteCatId);
      setDeleteCatId(null);
      toast.success("Category deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleSaveItem = async () => {
    const pricePaise = Math.round(parseFloat(itemPrice) * 100);
    if (!itemName.trim() || isNaN(pricePaise) || pricePaise < 0) {
      toast.error("Please fill in name and valid price");
      return;
    }
    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          name: itemName.trim(),
          description: itemDesc.trim() || null,
          price: pricePaise,
          isVeg: itemIsVeg,
          categoryId: itemCategoryId,
        });
        toast.success("Item updated");
      } else {
        await createItem.mutateAsync({
          categoryId: itemCategoryId,
          name: itemName.trim(),
          description: itemDesc.trim() || undefined,
          price: pricePaise,
          isVeg: itemIsVeg,
        });
        toast.success("Item added");
      }
      resetItemForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      await deleteItem.mutateAsync(deleteItemId);
      setDeleteItemId(null);
      toast.success("Item deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleToggle = async (item: VendorMenuItem) => {
    try {
      await toggleAvail.mutateAsync({ id: item.id, isAvailable: !item.isAvailable });
      toast.success(item.isAvailable ? "Marked sold out" : "Back in stock");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">Menu</h1>
        <Button size="sm" onClick={() => setShowAddCat(true)}>
          <PlusIcon className="mr-1 h-4 w-4" /> Category
        </Button>
      </div>

      {isLoading && (
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      )}

      {!isLoading && categories && categories.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-3xl">🍽️</p>
          <p className="mt-2 font-semibold text-ink">No menu categories yet</p>
          <p className="mt-1 text-sm text-ink-soft">Add a category to start building your menu.</p>
        </div>
      )}

      {/* Categories */}
      {categories?.map((cat) => (
        <div key={cat.id} className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">{cat.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setEditCat({ ...cat })}
                className="text-ink-faint hover:text-ink"
              >
                <EditIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteCatId(cat.id)}
                className="text-ink-faint hover:text-danger"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => openAddItem(cat.id)}
                className="flex items-center gap-1 text-sm font-semibold text-accent-600"
              >
                <PlusIcon className="h-4 w-4" /> Item
              </button>
            </div>
          </div>

          {cat.items.length === 0 && (
            <p className="mt-2 text-sm text-ink-faint">No items in this category.</p>
          )}

          <div className="mt-2 space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-sm">
                <VegDot isVeg={item.isVeg} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold", !item.isAvailable && "line-through text-ink-faint")}>
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-soft">{formatPrice(item.price)}</p>
                </div>
                <button
                  onClick={() => handleToggle(item)}
                  className={cn(
                    "rounded-pill px-3 py-1 text-xs font-semibold transition-colors",
                    item.isAvailable
                      ? "bg-veg-soft text-veg"
                      : "bg-nonveg-soft text-danger"
                  )}
                >
                  {item.isAvailable ? "Available" : "Sold out"}
                </button>
                <button onClick={() => openEditItem(item)} className="text-ink-faint hover:text-ink">
                  <EditIcon className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteItemId(item.id)} className="text-ink-faint hover:text-danger">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add category dialog */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={() => setShowAddCat(false)} />
          <div className="animate-slide-up relative w-full max-w-sm rounded-2xl bg-surface p-5">
            <h3 className="text-lg font-bold text-ink">New Category</h3>
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Beverages"
              className="mt-3 h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowAddCat(false)}>Cancel</Button>
              <Button fullWidth onClick={handleAddCategory} disabled={createCategory.isPending}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit category dialog */}
      {editCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={() => setEditCat(null)} />
          <div className="animate-slide-up relative w-full max-w-sm rounded-2xl bg-surface p-5">
            <h3 className="text-lg font-bold text-ink">Edit Category</h3>
            <input
              value={editCat.name}
              onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
              className="mt-3 h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setEditCat(null)}>Cancel</Button>
              <Button fullWidth onClick={handleUpdateCategory}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete category confirm */}
      <ConfirmDialog
        open={!!deleteCatId}
        title="Delete category?"
        message="All items in this category will also be removed."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
      />

      {/* Item form sheet */}
      <Sheet
        open={showItemForm}
        onClose={resetItemForm}
        title={editingItem ? "Edit Item" : "Add Item"}
        footer={
          <Button fullWidth onClick={handleSaveItem} disabled={createItem.isPending || updateItem.isPending}>
            {editingItem ? "Save Changes" : "Add Item"}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Name</label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item name"
              className="h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description</label>
            <textarea
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Price (₹)</label>
            <input
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setItemIsVeg(true)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium",
                  itemIsVeg ? "border-veg bg-veg-soft text-veg" : "border-line text-ink-soft"
                )}
              >
                <VegDot isVeg={true} /> Veg
              </button>
              <button
                onClick={() => setItemIsVeg(false)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium",
                  !itemIsVeg ? "border-nonveg bg-nonveg-soft text-nonveg" : "border-line text-ink-soft"
                )}
              >
                <VegDot isVeg={false} /> Non-veg
              </button>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Delete item confirm */}
      <ConfirmDialog
        open={!!deleteItemId}
        title="Delete item?"
        message="This item will be permanently removed from the menu."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
      />
    </div>
  );
}
