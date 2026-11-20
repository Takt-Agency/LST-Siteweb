import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Polices du site (auto-hébergées par next/font au build).
 * - Inter : texte courant.
 * - Archivo (axe de largeur wdth 62–125) : grands titres en capitales, utilisée à 125 % / 800 (classe `.display`).
 * - JetBrains Mono : HUD, labels, compteurs (classe `.mono`).
 * Pour changer de combinaison, ne modifier que ce fichier (les variables CSS restent les mêmes).
 */
export const inter = Inter({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

export const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display-face",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
  // Pas critique pour le premier affichage (HUD, labels) : pas de préchargement.
  preload: false,
});

export const fontVariables = `${inter.variable} ${display.variable} ${mono.variable}`;
