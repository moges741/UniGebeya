import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'USER' | 'ADMIN';
export type ListingType = 'FOR_SALE' | 'WANTED' | 'RENTAL' | 'SERVICE' | 'EXCHANGE';
export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CurrencyCode = 'ETB' | 'USD';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: UserRole;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  listingType: ListingType;
  status: ListingStatus;
  rejectionReason: string;
  location: string;
  contactPhone: string;
  contactTelegram: string;
  contactEmail: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  userId: string;
  sellerName: string;
  sellerOrg: string;
  isFeatured: boolean;
  isDemo: boolean;
  approvedBy: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export const LISTING_TYPE_OPTIONS: { value: ListingType; label: string; shortLabel: string }[] = [
  { value: 'FOR_SALE', label: 'For Sale', shortLabel: 'For Sale' },
  { value: 'RENTAL', label: 'Equipment Rental', shortLabel: 'Rental' },
  { value: 'SERVICE', label: 'Skill & Service', shortLabel: 'Service' },
  { value: 'WANTED', label: 'Wanted by Buyer', shortLabel: 'Wanted' },
  { value: 'EXCHANGE', label: 'Exchange / Trade', shortLabel: 'Exchange' },
];

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  FOR_SALE: 'For Sale',
  RENTAL: 'Rental',
  SERVICE: 'Service',
  WANTED: 'Wanted',
  EXCHANGE: 'Exchange',
};

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const listingFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(120, 'Title cannot exceed 120 characters'),
    description: z
      .string()
      .trim()
      .min(10, 'Please include at least 10 characters describing the item or service')
      .max(2500, 'Description cannot exceed 2,500 characters'),
    listingType: z.enum(['FOR_SALE', 'WANTED', 'RENTAL', 'SERVICE', 'EXCHANGE']),
    categoryId: z.string().min(1, 'Please select a category'),
    price: z
      .number({ message: 'Enter a valid numeric price' })
      .min(0, 'Price must be 0 or greater')
      .max(100000000, 'Price is too high'),
    currency: z.enum(['ETB', 'USD']),
    location: z
      .string()
      .trim()
      .min(2, 'Enter campus, building, or neighborhood')
      .max(120, 'Location cannot exceed 120 characters'),
    contactPhone: z
      .string()
      .trim()
      .max(40, 'Phone number is too long'),
    contactTelegram: z
      .string()
      .trim()
      .max(64, 'Telegram username is too long'),
    contactEmail: z
      .string()
      .trim()
      .max(160, 'Email is too long'),
    sellerName: z
      .string()
      .trim()
      .min(2, 'Seller name is required')
      .max(100, 'Seller name is too long'),
    sellerOrg: z
      .string()
      .trim()
      .max(120, 'Campus or business name is too long'),
  })
  .refine(
    (vals) =>
      vals.contactPhone.length > 0 ||
      vals.contactTelegram.length > 0 ||
      vals.contactEmail.length > 0,
    {
      message: 'Provide at least one contact method (phone, Telegram, or email)',
      path: ['contactPhone'],
    }
  );

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(80),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  description: z.string().trim().max(300),
  sortOrder: z.number({ message: 'Enter a sort order' }).min(0).max(1000),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  phone: z.string().trim().max(40),
  organization: z.string().trim().max(120),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function formatPrice(price: number, currency: CurrencyCode, listingType?: ListingType): string {
  if (price === 0 && (listingType === 'EXCHANGE' || listingType === 'WANTED')) {
    return listingType === 'EXCHANGE' ? 'Open to Trade' : 'Negotiable Budget';
  }
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price);

  const suffix = listingType === 'RENTAL' ? ' / day' : listingType === 'SERVICE' ? ' starting' : '';
  return currency === 'ETB' ? `${formatted} ETB${suffix}` : `$${formatted}${suffix}`;
}

export function formatDate(value?: Timestamp | Date | null): string {
  if (!value) return 'Just now';
  const date = value instanceof Timestamp ? value.toDate() : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
