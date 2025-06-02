import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cnjoin(...args: (string | undefined | null | boolean)[]) {
  return args.filter(Boolean).join(' ');
}
