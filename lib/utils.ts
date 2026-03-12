import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate age in months from a date of birth
 * @param dateOfBirth - Date of birth as string or Date object
 * @returns Age in months (non-negative integer)
 */
export function calculateAgeInMonths(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth
  const now = new Date()
  const ageInMonths = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )
  return Math.max(0, ageInMonths) // Ensure non-negative
}

/**
 * Format age in months to readable string (e.g., "2y 3m" or "5m")
 * @param ageInMonths - Age in months
 * @returns Formatted age string
 */
export function formatAge(ageInMonths: number): string {
  if (ageInMonths < 0) return "0m"
  
  const years = Math.floor(ageInMonths / 12)
  const months = ageInMonths % 12
  
  if (years === 0) {
    return `${months}m`
  } else if (months === 0) {
    return `${years}y`
  } else {
    return `${years}y ${months}m`
  }
}

/**
 * Calculate and format age from date of birth
 * @param dateOfBirth - Date of birth as string or Date object
 * @returns Formatted age string (e.g., "2y 3m")
 */
export function formatAgeFromDOB(dateOfBirth: string | Date): string {
  const ageInMonths = calculateAgeInMonths(dateOfBirth)
  return formatAge(ageInMonths)
}

