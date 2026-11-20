import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { DEFAULT_CATEGORIES, SHOWCASE_DEMO_LISTINGS } from '../data/seedData';
import {
  Category,
  CategoryFormValues,
  Listing,
  ListingFormValues,
  ListingStatus,
  UserProfile,
} from '../types/marketplace';

function sortTimestampDesc(
  a?: Timestamp | Date | null,
  b?: Timestamp | Date | null
): number {
  const timeA = a instanceof Timestamp ? a.toMillis() : a instanceof Date ? a.getTime() : 0;
  const timeB = b instanceof Timestamp ? b.toMillis() : b instanceof Date ? b.getTime() : 0;
  return timeB - timeA;
}

function createCleanId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------
export async function fetchCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Category, 'id'>),
    }));
    return items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createCategory(values: CategoryFormValues): Promise<string> {
  const id = values.slug.replace(/[^a-z0-9-]/g, '') || createCleanId('cat');
  const path = `categories/${id}`;
  try {
    await setDoc(doc(db, 'categories', id), {
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description.trim(),
      sortOrder: Number(values.sortOrder) || 10,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCategory(id: string, values: CategoryFormValues): Promise<void> {
  const path = `categories/${id}`;
  try {
    await updateDoc(doc(db, 'categories', id), {
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      description: values.description.trim(),
      sortOrder: Number(values.sortOrder) || 10,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -----------------------------------------------------------------------------
// Public & User Listings
// -----------------------------------------------------------------------------
export async function fetchApprovedListings(): Promise<Listing[]> {
  const path = 'listings';
  try {
    const q = query(collection(db, path), where('status', 'in', ['APPROVED', 'SOLD']));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Listing, 'id'>),
    }));
    return items.sort((a, b) => sortTimestampDesc(a.createdAt, b.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchListingById(listingId: string): Promise<Listing | null> {
  const path = `listings/${listingId}`;
  try {
    const snap = await getDoc(doc(db, 'listings', listingId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Listing, 'id'>) };
    }
    const showcaseFallback = SHOWCASE_DEMO_LISTINGS.find((item) => item.id === listingId);
    if (showcaseFallback) {
      return {
        ...showcaseFallback,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  } catch (error) {
    // Allow unseeded showcase preview fallback if ID matches a static demo item
    const showcaseFallback = SHOWCASE_DEMO_LISTINGS.find((item) => item.id === listingId);
    if (showcaseFallback) {
      return {
        ...showcaseFallback,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchUserListings(userId: string): Promise<Listing[]> {
  const path = 'listings';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Listing, 'id'>),
    }));
    return items.sort((a, b) => sortTimestampDesc(a.createdAt, b.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createListing(params: {
  userId: string;
  values: ListingFormValues;
  categoryName: string;
  images: string[];
}): Promise<string> {
  const id = createCleanId('lst');
  const path = `listings/${id}`;
  try {
    await setDoc(doc(db, 'listings', id), {
      title: params.values.title.trim(),
      description: params.values.description.trim(),
      price: Number(params.values.price),
      currency: params.values.currency,
      listingType: params.values.listingType,
      status: 'PENDING' as ListingStatus,
      rejectionReason: '',
      location: params.values.location.trim(),
      contactPhone: params.values.contactPhone.trim(),
      contactTelegram: params.values.contactTelegram.trim(),
      contactEmail: params.values.contactEmail.trim(),
      categoryId: params.values.categoryId,
      categoryName: params.categoryName,
      images: params.images.slice(0, 3),
      userId: params.userId,
      sellerName: params.values.sellerName.trim(),
      sellerOrg: params.values.sellerOrg.trim(),
      isFeatured: false,
      isDemo: false,
      approvedBy: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOwnListing(params: {
  listingId: string;
  values: ListingFormValues;
  categoryName: string;
  images: string[];
}): Promise<void> {
  const path = `listings/${params.listingId}`;
  try {
    await updateDoc(doc(db, 'listings', params.listingId), {
      title: params.values.title.trim(),
      description: params.values.description.trim(),
      price: Number(params.values.price),
      currency: params.values.currency,
      listingType: params.values.listingType,
      location: params.values.location.trim(),
      contactPhone: params.values.contactPhone.trim(),
      contactTelegram: params.values.contactTelegram.trim(),
      contactEmail: params.values.contactEmail.trim(),
      categoryId: params.values.categoryId,
      categoryName: params.categoryName,
      images: params.images.slice(0, 3),
      sellerName: params.values.sellerName.trim(),
      sellerOrg: params.values.sellerOrg.trim(),
      status: 'PENDING' as ListingStatus,
      rejectionReason: '',
      approvedBy: '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteListing(listingId: string): Promise<void> {
  const path = `listings/${listingId}`;
  try {
    await deleteDoc(doc(db, 'listings', listingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -----------------------------------------------------------------------------
// Admin Moderation & Management
// -----------------------------------------------------------------------------
export async function fetchAllListingsAdmin(): Promise<Listing[]> {
  const path = 'listings';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Listing, 'id'>),
    }));
    return items.sort((a, b) => sortTimestampDesc(a.createdAt, b.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllUsersAdmin(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map((d) => d.data() as UserProfile);
    return items.sort((a, b) => sortTimestampDesc(a.createdAt, b.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function adminApproveListing(listingId: string, adminEmail: string): Promise<void> {
  const path = `listings/${listingId}`;
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      status: 'APPROVED' as ListingStatus,
      rejectionReason: '',
      approvedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminRejectListing(
  listingId: string,
  rejectionReason: string
): Promise<void> {
  const path = `listings/${listingId}`;
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      status: 'REJECTED' as ListingStatus,
      rejectionReason: rejectionReason.trim() || 'Listing did not meet Uni Gebeya marketplace guidelines.',
      approvedBy: '',
      isFeatured: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminToggleFeatured(listingId: string, isFeatured: boolean): Promise<void> {
  const path = `listings/${listingId}`;
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      isFeatured,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminEditListing(
  listingId: string,
  updates: Partial<Pick<Listing, 'title' | 'description' | 'price' | 'location' | 'categoryId' | 'categoryName'>>
): Promise<void> {
  const path = `listings/${listingId}`;
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function ensureDefaultCategoriesAdmin(): Promise<void> {
  const existing = await fetchCategories();
  if (existing.length > 0) return;

  for (const cat of DEFAULT_CATEGORIES) {
    const path = `categories/${cat.id}`;
    try {
      await setDoc(doc(db, 'categories', cat.id), {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export async function seedDemoCatalogAdmin(adminUid: string, adminEmail: string): Promise<number> {
  await ensureDefaultCategoriesAdmin();

  let seededCount = 0;
  for (const item of SHOWCASE_DEMO_LISTINGS) {
    const path = `listings/${item.id}`;
    try {
      const ref = doc(db, 'listings', item.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          title: item.title,
          description: item.description,
          price: item.price,
          currency: item.currency,
          listingType: item.listingType,
          status: 'APPROVED',
          rejectionReason: '',
          location: item.location,
          contactPhone: item.contactPhone,
          contactTelegram: item.contactTelegram,
          contactEmail: item.contactEmail,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          images: item.images,
          userId: adminUid,
          sellerName: item.sellerName,
          sellerOrg: item.sellerOrg,
          isFeatured: item.isFeatured,
          isDemo: true,
          approvedBy: adminEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        seededCount += 1;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
  return seededCount;
}

export async function clearDemoListingsAdmin(): Promise<number> {
  const all = await fetchAllListingsAdmin();
  const demoItems = all.filter((item) => item.isDemo);
  for (const item of demoItems) {
    await deleteListing(item.id);
  }
  return demoItems.length;
}

export async function toggleListingSold(
  listingId: string,
  currentStatus: ListingStatus
): Promise<ListingStatus> {
  const nextStatus: ListingStatus = currentStatus === 'SOLD' ? 'APPROVED' : 'SOLD';
  const path = `listings/${listingId}`;
  try {
    await updateDoc(doc(db, 'listings', listingId), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
    return nextStatus;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function adminToggleUserRole(
  userId: string,
  targetRole: 'ADMIN' | 'USER',
  userEmail: string
): Promise<void> {
  const userPath = `users/${userId}`;
  const adminPath = `admins/${userId}`;
  try {
    if (targetRole === 'ADMIN') {
      await setDoc(doc(db, 'admins', userId), {
        uid: userId,
        email: userEmail,
        grantedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', userId), {
        role: 'ADMIN',
        updatedAt: serverTimestamp(),
      });
    } else {
      try {
        await deleteDoc(doc(db, 'admins', userId));
      } catch (adminDelErr) {
        console.warn('Admin record deletion warning:', adminDelErr);
      }
      await updateDoc(doc(db, 'users', userId), {
        role: 'USER',
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
    throw error;
  }
}

export async function adminDeleteUser(userId: string): Promise<void> {
  const userPath = `users/${userId}`;
  try {
    try {
      await deleteDoc(doc(db, 'admins', userId));
    } catch {}
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, userPath);
    throw error;
  }
}
