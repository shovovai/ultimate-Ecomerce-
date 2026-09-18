import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

// Singleton document (_id: "storeSettings") edited from /admin/settings
export const storeSettingsType = defineType({
  name: "storeSettings",
  title: "Store Settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "branding", title: "Admin Branding", default: true },
    { name: "store", title: "Store Info" },
    { name: "announcement", title: "Announcement Bar" },
  ],
  fields: [
    defineField({
      name: "adminPanelTitle",
      title: "Admin Panel Title",
      type: "string",
      group: "branding",
    }),
    defineField({
      name: "adminLogoUrl",
      title: "Admin Logo URL",
      type: "url",
      group: "branding",
    }),
    defineField({
      name: "accentColor",
      title: "Accent Color (hex)",
      type: "string",
      group: "branding",
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{3}){1,2}$/, { name: "hex color" }),
    }),
    defineField({
      name: "storeName",
      title: "Store Name",
      type: "string",
      group: "store",
    }),
    defineField({
      name: "supportEmail",
      title: "Support Email",
      type: "string",
      group: "store",
    }),
    defineField({
      name: "supportPhone",
      title: "Support Phone",
      type: "string",
      group: "store",
    }),
    defineField({
      name: "currencySymbol",
      title: "Currency Symbol (reports & exports)",
      type: "string",
      group: "store",
    }),
    defineField({
      name: "announcementEnabled",
      title: "Show Announcement Bar",
      type: "boolean",
      group: "announcement",
      initialValue: false,
    }),
    defineField({
      name: "announcementText",
      title: "Announcement Text",
      type: "string",
      group: "announcement",
    }),
    defineField({
      name: "announcementLink",
      title: "Announcement Link",
      type: "string",
      group: "announcement",
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "updatedBy",
      title: "Updated By",
      type: "string",
      readOnly: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Store Settings" }),
  },
});
