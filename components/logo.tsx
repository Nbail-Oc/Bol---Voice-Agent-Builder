import type React from "react";

export const LogoIcon = ({
	className = "size-5 shrink-0 object-contain",
	alt = "Bol Logo",
	src = "/LOGO.png",
	...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
	<img
		src={src}
		alt={alt}
		className={className}
		{...props}
	/>
);

export const Logo = LogoIcon;
export default LogoIcon;
