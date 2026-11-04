"use client";

import { useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

type ParallaxImageProps = Omit<ImageProps, "fill" | "className"> & {
  /** Classes for the frame (borders, background, aspect ratio override). */
  className?: string;
  imageClassName?: string;
};

/**
 * A gently drifting product photograph.
 *
 * The frame is 16:10 and the photographs are 3:2, so the image has a little
 * spare height. The inner layer is 6% taller than the frame and slides up to
 * 5% of its height, which gives a slow depth effect without ever exposing an
 * edge or cropping the sides of the bottle and box. The motion is driven by
 * scroll position through a transform (no layout work), and is disabled in CSS
 * for visitors who prefer reduced motion.
 */
export default function ParallaxImage({
  className,
  imageClassName,
  alt,
  ...image
}: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "0%"]);

  return (
    <div
      ref={frameRef}
      className={cn("relative aspect-[16/10] overflow-hidden", className)}
    >
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 top-0 h-[106%] motion-reduce:!transform-none"
      >
        <Image {...image} alt={alt} fill className={cn("object-cover", imageClassName)} />
      </motion.div>
    </div>
  );
}
