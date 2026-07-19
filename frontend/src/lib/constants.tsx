import { Clock, ChefHat, PackageCheck, Check, Ban } from "lucide-react";
import { Order } from "@/types";

export const CATEGORIES = [
  { name: "Hot Beverages", icon: "☕", emoji: "☕" },
  { name: "Cold Beverages", icon: "🥤", emoji: "🥤" },
  { name: "Bread", icon: "🥖", emoji: "🥖" },
  { name: "Pizza", icon: "🍕", emoji: "🍕" },
  { name: "Pastas & Nachos", icon: "🍝", emoji: "🍝" },
  { name: "Burgers & Sandwiches", icon: "🍔", emoji: "🍔" },
  { name: "Fries", icon: "🍟", emoji: "🍟" },
  { name: "Maggi", icon: "🍜", emoji: "🍜" },
  { name: "Milk Shakes", icon: "🥛", emoji: "🥛" },
  { name: "Drinks - Mocktails", icon: "🍹", emoji: "🍹" },
  { name: "Pav Bhaji", icon: "🍲", emoji: "🍲" },
  { name: "Chinese", icon: "🥡", emoji: "🥡" },
  { name: "Rice", icon: "🍚", emoji: "🍚" },
  { name: "Chinese Gravy", icon: "🍛", emoji: "🍛" },
  { name: "Chinese Dry", icon: "🍱", emoji: "🍱" },
];

export const PIE_DATA = [
  { name: "Completed", value: 847, color: "#22c55e" },
  { name: "Preparing", value: 23, color: "#C8813A" },
  { name: "Pending", value: 12, color: "#eab308" },
  { name: "Cancelled", value: 34, color: "#ef4444" },
];

export const SEED_ORDERS: Order[] = [];

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PREPARING: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  READY: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-3.5 h-3.5" />,
  PREPARING: <ChefHat className="w-3.5 h-3.5" />,
  READY: <PackageCheck className="w-3.5 h-3.5" />,
  COMPLETED: <Check className="w-3.5 h-3.5" />,
  CANCELLED: <Ban className="w-3.5 h-3.5" />,
};
