// 汎用ユーティリティ関数

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Tailwindクラスを安全にマージするヘルパー */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
