"use client";

import { CldImage } from "next-cloudinary";
import Image from "next/image";

/**
 * Drop-in image component. Uses CldImage when src looks like a Cloudinary
 * public_id (no protocol). Falls back to next/image for external URLs.
 *
 * Usage:
 *   <CloudinaryImage src="surgical-essence/products/scalpel" alt="..." width={400} height={300} />
 *   <CloudinaryImage src="https://example.com/img.jpg" alt="..." width={400} height={300} />
 */
export default function CloudinaryImage({ src, alt, width, height, className, ...props }) {
  const isCloudinaryId = src && !src.startsWith("http");

  if (isCloudinaryId) {
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}
