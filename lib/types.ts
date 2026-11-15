export type Gender = 'women' | 'men' | 'unisex';

export interface ProductImage {
  url: string;
  alt?: string;
  isCover?: boolean;
}

export interface ProductVariant {
  id?: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex?: string;
  stock: number;
  costPricePaise?: number;
  sellingPricePaise?: number;
  variantImageUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  availabilityMode?: 'SUPPLIER_CHECK_REQUIRED' | 'MANUALLY_CONFIRMED' | 'OWN_VERIFIED';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  gender: Gender;
  image: string;
  sortOrder?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  gender: Gender;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  costPricePaise?: number;
  shippingCostPaise?: number;
  packagingCostPaise?: number;
  otherExpensesPaise?: number;
  brand?: string;
  productType?: string;
  fabric?: string;
  material?: string;
  fit?: string;
  pattern?: string;
  occasion?: string;
  sleeveType?: string;
  neckType?: string;
  care?: string;
  keywords?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | string;
  category: string;
  categoryName: string;
  collectionId?: string;
  collectionName?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  sourcing?: 'own' | 'on_demand' | 'meesho' | string;
  supplierStatus?: 'NOT_VERIFIED' | 'VERIFICATION_PENDING' | 'AVAILABLE' | 'OUT_OF_STOCK' | 'TEMPORARILY_UNAVAILABLE' | string;
  supplierSourceUrl?: string;
  supplierNotes?: string;
  supplierVerificationDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  supplierInfo?: ResellingProductInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResellingProductInfo {
  supplierName: string;
  supplierSku: string;
  supplierUrl: string;
  supplierCostPaise: number;
  estShippingCostPaise: number;
  estPackagingCostPaise: number;
  platformFeePaise?: number;
  fulfilmentNotes?: string;
  stockVerifiedAt?: string;
  priceVerifiedAt?: string;
}

export interface MarginAnalysis {
  sellingPricePaise: number;
  supplierCostPaise: number;
  shippingPaise: number;
  packagingPaise: number;
  platformFeePaise: number;
  totalCostPaise: number;
  grossMarginPaise: number;
  grossMarginPercentage: number;
  healthTier: 'optimal' | 'moderate' | 'critical';
}

export interface CartItem {
  productId: string;
  productName: string;
  slug: string;
  sku: string;
  size: string;
  color: string;
  pricePaise: number;
  imageUrl: string;
  quantity: number;
  sourcing?: 'own' | 'on_demand' | 'meesho' | string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type OrderStatus =
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PROCESSING';

export type SourcingStatus =
  | 'not_applicable'
  | 'to_source'
  | 'purchased'
  | 'supplier_shipped'
  | 'received_qc_passed'
  | 'NOT_APPLICABLE'
  | 'TO_SOURCE'
  | 'PURCHASED'
  | 'SUPPLIER_SHIPPED'
  | 'RECEIVED_QC_PASSED';

export interface OrderItem {
  productId?: string;
  productName: string;
  slug?: string;
  sku: string;
  size: string;
  color: string;
  qty: number;
  quantity?: number;
  pricePaise: number;
  unitPricePaise?: number;
  totalPricePaise?: number;
  imageUrl: string;
  sourcing?: 'own' | 'on_demand' | 'meesho' | string;
  sourcingType?: string;
  supplierCostPaise?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: ShippingAddress;
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItem[];
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  status: OrderStatus;
  sourcingStatus: SourcingStatus;
  paymentMethod: 'COD' | 'PREPAID';
  paymentStatus: 'pending' | 'completed' | 'failed';
  trackingNumber?: string;
  trackingCarrier?: string;
  supplierOrderId?: string;
  notes?: string;
}

export interface AvatarState {
  gender: 'female' | 'male' | 'women' | 'men';
  bodyShape: 'slender' | 'athletic' | 'curvy' | 'broad';
  skinTone: string; // hex
  heightCm: number;
  selectedCategory: string;
  selectedGarmentId: string | null;
  selectedColor: string;
  selectedSize?: string;
  garmentName?: string;
  fabricFinish?: 'satin' | 'cotton' | 'wool' | 'organza';
  studioLighting?: 'atelier' | 'runway' | 'noir';
  cameraPreset?: 'front' | 'side' | 'back' | 'close' | 'full';
}

export interface SavedLook {
  id: string;
  title: string;
  date: string;
  avatarState: AvatarState;
  productIds: string[];
}

export interface TryOnJob {
  id: string;
  userImageUrl: string;
  productId: string;
  productName: string;
  clothingImageUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: 'fashn-ai' | 'simulation-demo';
  resultImageUrl?: string;
  createdAt: string;
  errorMessage?: string;
}

export interface DashboardMetrics {
  totalRevenuePaise: number;
  totalOrders: number;
  successfulOrders: number;
  pendingOrders: number;
  aovPaise: number;
  estimatedGrossMarginPercent: number;
  lowStockCount: number;
}

export interface CMSConfig {
  announcementText: string;
  announcementActive: boolean;
  announcementExpiresAt?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroTagline: string;
  heroCtaText: string;
}
