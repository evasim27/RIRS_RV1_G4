"use client";

import Image from "next/image";
import React from "react";

type Props = {
	src: string;
	alt?: string;
	className?: string;
	fill?: boolean;
	sizes?: string;
	priority?: boolean;
};

export default function SmartImage({
	src,
	alt = "",
	className = "",
	fill = false,
	sizes,
	priority,
}: Props) {
	const isExternal = /^https?:\/\//i.test(src);

	// Render a plain <img> for external URLs so you don't need to add the host to next.config
	if (isExternal) {
		// When using `fill` the parent container is expected to be positioned and sized.
		// The caller already uses a wrapper (absolute inset-0) so `w-full h-full` in className works.
		return <img src={src} alt={alt} className={className} />;
	}

	// For internal images use next/image for optimization
	return (
		<Image
			src={src}
			alt={alt}
			className={className}
			fill={fill}
			sizes={sizes}
			priority={priority}
		/>
	);
}
