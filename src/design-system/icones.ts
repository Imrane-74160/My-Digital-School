/**
 * Table des icônes : nom Figma (français) → composant `lucide-react`.
 *
 * Générée depuis la section « Icônes (Figma → lucide-react) » de `docs/04-design-system.md`
 * pour éviter toute erreur de recopie. Trait 1,5 px sur une grille de 24, couleur héritée
 * (`currentColor`), conformément au design system.
 *
 * Une seule icône du Figma n'existe pas dans lucide : « Trépied ». Son tracé est repris
 * tel quel depuis le Figma dans `TrepiedIcone.tsx`, comme le prévoit `docs/04`.
 */
import {
  ArrowLeftRight,
  ArrowUpRight,
  Ban,
  Battery,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  EllipsisVertical,
  Fan,
  Flag,
  Folder,
  FolderOpen,
  GalleryVerticalEnd,
  HardDrive,
  Headphones,
  History,
  House,
  Image,
  Laptop,
  LayoutDashboard,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Lock,
  LockOpen,
  Mail,
  MapPin,
  Maximize2,
  Mic,
  Minus,
  Moon,
  Mouse,
  Package,
  Pencil,
  Plug,
  Plus,
  Printer,
  Puzzle,
  Radio,
  ReceiptText,
  RotateCcw,
  ScanLine,
  School,
  Search,
  Shield,
  SlidersHorizontal,
  SquarePen,
  Tag,
  TriangleAlert,
  Undo2,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wallet,
  X,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Trepied } from './TrepiedIcone'

/** Surface commune aux icônes lucide et aux icônes reprises du Figma. */
export type ProprietesIcone = {
  className?: string
  strokeWidth?: number
  'aria-hidden'?: boolean
} & Pick<SVGProps<SVGSVGElement>, 'focusable'>

export type ComposantIcone = ComponentType<ProprietesIcone>

export const ICONES = {
  Agrandir: Maximize2,
  Alerte: TriangleAlert,
  Ampoule: Lightbulb,
  'Appareil photo': Camera,
  Batterie: Battery,
  Bouclier: Shield,
  Cadenas: Lock,
  'Cadenas ouvert': LockOpen,
  Caméra: Video,
  'Carte SD': HardDrive,
  'Cartes de jeu': GalleryVerticalEnd,
  'Casque audio': Headphones,
  'Chevron bas': ChevronDown,
  'Chevron droit': ChevronRight,
  'Chevron gauche': ChevronLeft,
  Cloche: Bell,
  Coche: Check,
  Colis: Package,
  Croix: X,
  Dossier: Folder,
  'Dossier ouvert': FolderOpen,
  Drapeau: Flag,
  Enregistreur: Radio,
  Enveloppe: Mail,
  Flèche: ArrowUpRight,
  Grille: LayoutGrid,
  Historique: History,
  Horloge: Clock,
  Image: Image,
  Import: Upload,
  Imprimante: Printer,
  Interdit: Ban,
  'Liste cochée': ListChecks,
  Loupe: Search,
  Lune: Moon,
  Maison: House,
  Micro: Mic,
  Modifier: SquarePen,
  Moins: Minus,
  'Ordinateur portable': Laptop,
  'Pièce de puzzle': Puzzle,
  Plus: Plus,
  "Plus d'options": EllipsisVertical,
  Porte: DoorOpen,
  Portefeuille: Wallet,
  Prise: Plug,
  Repère: MapPin,
  Retour: Undo2,
  Reçu: ReceiptText,
  Rotation: RotateCcw,
  Réglages: SlidersHorizontal,
  Scanner: ScanLine,
  Souris: Mouse,
  Stylo: Pencil,
  'Tableau de bord': LayoutDashboard,
  Utilisateur: User,
  'Utilisateur validé': UserCheck,
  Utilisateurs: Users,
  Ventilateur: Fan,
  Échange: ArrowLeftRight,
  École: School,
  Étiquette: Tag,
  Trépied: Trepied,
} satisfies Record<string, ComposantIcone>

export type NomIcone = keyof typeof ICONES

export const NOMS_ICONES = Object.keys(ICONES) as NomIcone[]

/** Renvoie le composant d'icône, ou `undefined` si le nom n'existe pas dans le design system. */
export const iconePeutEtre = (nom: string): ComposantIcone | undefined =>
  (ICONES as Record<string, ComposantIcone>)[nom]

/** Tailles d'icône utilisées par le Figma, sur la grille 24. */
export const TAILLES_ICONE = {
  xs: 13,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 24,
} as const

export type TailleIcone = keyof typeof TAILLES_ICONE
