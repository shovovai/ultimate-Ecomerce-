import "server-only";
import { backendClient } from "@/sanity/lib/backendClient";
import { brand } from "@/config/brand";

export const STORE_SETTINGS_ID = "storeSettings";

export interface StoreSettings {
  adminPanelTitle: string;
  adminLogoUrl: string;
  accentColor: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currencySymbol: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  adminPanelTitle: `${brand.name} Admin`,
  adminLogoUrl: "",
  accentColor: "#c2542d",
  storeName: brand.name,
  supportEmail: brand.emails.support,
  supportPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",
  currencySymbol: "$",
  announcementEnabled: false,
  announcementText: "",
  announcementLink: "",
};

export const EDITABLE_SETTINGS_KEYS = Object.keys(
  DEFAULT_STORE_SETTINGS
) as (keyof StoreSettings)[];

/** Reads the singleton settings doc, falling back to defaults for empty fields. */
export async function getStoreSettings(
  options: { fresh?: boolean } = {}
): Promise<StoreSettings> {
  try {
    const doc = await backendClient.fetch<Partial<StoreSettings> | null>(
      `*[_id == $id][0]`,
      { id: STORE_SETTINGS_ID },
      options.fresh
        ? { cache: "no-store" }
        : { next: { revalidate: 60, tags: ["storeSettings"] } }
    );
    const merged = { ...DEFAULT_STORE_SETTINGS };
    if (doc) {
      for (const key of EDITABLE_SETTINGS_KEYS) {
        const value = doc[key];
        if (value !== undefined && value !== null && value !== "") {
          (merged as Record<string, unknown>)[key] = value;
        }
      }
      merged.updatedAt = doc.updatedAt;
      merged.updatedBy = doc.updatedBy;
    }
    return merged;
  } catch (error) {
    console.error("Failed to load store settings:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}
