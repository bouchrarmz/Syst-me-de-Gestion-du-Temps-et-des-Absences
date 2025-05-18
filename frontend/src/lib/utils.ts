
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Fonction utilitaire pour fusionner les classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour formater les dates
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Fonction pour formater les heures
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fonction pour calculer la différence entre deux dates en heures
export function hoursDifference(start: Date | string, end: Date | string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  return diffMs / (1000 * 60 * 60)
}

// Vérifier si un utilisateur est en retard (après 8h30)
export function isLate(arrivalTime: Date | string): boolean {
  const arrival = new Date(arrivalTime)
  const hours = arrival.getHours()
  const minutes = arrival.getMinutes()
  
  // Si l'arrivée est après 8h30, c'est un retard
  return (hours > 8) || (hours === 8 && minutes > 30)
}

// Générer un identifiant unique
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
