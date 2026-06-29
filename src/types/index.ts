// Frontend domain types — mirror the API responses from Agent A's routes.
// Money values are integers in paise unless noted.

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "rejected";

export interface OpenHoursEntry {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}
export type OpenHours = Record<string, OpenHoursEntry>;

// ─── Vendors ──────────────────────────────────────────────────────

export interface VendorCard {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  cuisineTags: string[];
  area: string;
  hasVeg: boolean;
  hasNonVeg: boolean;
  avgRating: number;
  ratingCount: number;
  mvrcRating: number | null;
  minOrder: number;
  packagingFee: number;
  avgPrepTimeMins: number;
  isOpen: boolean;
  nextOpenTime: string | null;
}

export interface CustomizationOption {
  id: string;
  groupId: string;
  name: string;
  priceDelta: number;
}

export interface CustomizationGroup {
  id: string;
  menuItemId: string;
  name: string;
  type: "single" | "multi";
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  customizationGroups: CustomizationGroup[];
}

export interface MenuCategory {
  id: string;
  vendorId: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface MvrcReport {
  id: string;
  vendorId: string;
  rating: number;
  hygieneScore: number;
  foodQualityScore: number;
  complianceNotes: string | null;
  correctiveActions: string | null;
  reportUrl: string | null;
  assessmentDate: string;
  createdBy: string;
}

export interface VendorDetail extends Omit<VendorCard, "minOrder"> {
  minOrder: number;
  mvrcReportUrl: string | null;
  mvrcAssessmentDate: string | null;
  openHours: OpenHours;
  upiId: string | null;
  upiQrImageUrl: string | null;
  isTemporarilyClosed: boolean;
  categories: MenuCategory[];
  latestMvrcReport: MvrcReport | null;
  upi: { upiId: string; qrImageUrl: string | null } | null;
}

/** A vendor as rendered on a card. The full list endpoint returns every
 *  field; search & favourites return a subset, so open/veg fields are optional. */
export interface VendorCardLike {
  id: string;
  name: string;
  imageUrl: string | null;
  cuisineTags: string[];
  area: string;
  avgRating: number;
  ratingCount: number;
  mvrcRating: number | null;
  avgPrepTimeMins: number;
  description?: string | null;
  hasVeg?: boolean;
  hasNonVeg?: boolean;
  minOrder?: number;
  isOpen?: boolean;
  nextOpenTime?: string | null;
  favouriteId?: string;
}

export interface DishSearchResult {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  vendorId: string;
  vendorName: string;
  categoryId: string;
}

export interface SearchResults {
  vendors: VendorCard[];
  dishes: DishSearchResult[];
}

// ─── Auth / User ──────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

// ─── Orders ───────────────────────────────────────────────────────

export interface SelectedOption {
  name: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  nameSnapshot: string;
  qty: number;
  unitPrice: number;
  selectedOptions: SelectedOption[];
  itemNote: string | null;
}

export interface StatusTimelineEntry {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  status: OrderStatus;
  rejectionReason: string | null;
  itemTotal: number;
  packagingFee: number;
  grandTotal: number;
  paymentMethod: string;
  specialInstructions: string | null;
  estimatedPrepMins: number | null;
  placedAt: string;
  statusTimeline: StatusTimelineEntry[];
  items: OrderItem[];
  vendor?: {
    name: string;
    imageUrl?: string | null;
    area?: string;
    upiId?: string | null;
    upiQrImageUrl?: string | null;
    avgPrepTimeMins?: number;
  };
  hasReview?: boolean;
  hasFeedback?: boolean;
  review?: { id: string; rating: number; text: string | null } | null;
}

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  text: string | null;
  createdAt: string;
}

export interface UpiDetails {
  upiId: string | null;
  upiQrImageUrl: string | null;
}
