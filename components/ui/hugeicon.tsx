import React from "react";
import { HugeiconsIcon, type HugeiconsProps, type IconSvgElement } from "@hugeicons/react";

export { HugeiconsIcon };
export type { HugeiconsProps, IconSvgElement };

/**
 * Creates a reusable React component wrapper around a Hugeicons stroke-rounded icon.
 * Useful when an icon needs to be passed as a component type (e.g. `icon: ComponentType`).
 */
export function createHugeIcon(icon: IconSvgElement, defaultProps?: Partial<HugeiconsProps>) {
  const IconComponent = React.forwardRef<SVGSVGElement, Omit<HugeiconsProps, "icon">>((props, ref) => {
    return <HugeiconsIcon ref={ref} icon={icon} {...defaultProps} {...props} />;
  });
  IconComponent.displayName = "HugeIcon";
  return IconComponent;
}

export default HugeiconsIcon;

