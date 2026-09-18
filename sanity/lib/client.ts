import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Read-only client for fetching data (uses CDN for better performance).
// Server-only: the read token lets it work with a PRIVATE dataset (recommended,
// so orders and customer data are not publicly readable).
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  token: process.env.SANITY_API_READ_TOKEN,
  stega: {
    studioUrl:
      process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}/studio`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/studio`,
  },
});

// Write client for mutations (authenticated) - Use this for create, update, delete operations
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Don't use CDN for write operations
  token: process.env.SANITY_API_TOKEN, // Server-side token with write permissions
});
