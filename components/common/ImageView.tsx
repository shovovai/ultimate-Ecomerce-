"use client";
import {
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
} from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  images?: Array<{
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
    _key: string;
  }>;
  isStock?: number;
  alt?: string;
}

const ImageView = ({ images = [], isStock, alt = "Product image" }: Props) => {
  const [active, setActive] = useState(images[0]);
  if (!active) return <div className="aspect-square w-full rounded-[2rem] bg-sand" />;

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:w-20 md:flex-col md:overflow-visible md:pb-0">
          {images.map((image) => (
            <button
              key={image._key}
              onClick={() => setActive(image)}
              aria-label="Show image"
              className={cn(
                "aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-sand ring-2 transition-all md:w-20",
                active._key === image._key ? "ring-clay" : "ring-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={urlFor(image).width(160).height(160).url()}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-contain p-1.5 mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}
      <div className="group relative aspect-square flex-1 overflow-hidden rounded-[2rem] bg-sand">
        <Image
          key={active._key}
          src={urlFor(active).width(1200).url()}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "animate-fade-in object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-105",
            isStock === 0 && "opacity-40 grayscale"
          )}
        />
        {isStock === 0 && (
          <span className="absolute left-5 top-5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">
            Sold out
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageView;
