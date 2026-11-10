import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Home01Icon, Time01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";

export type SidebarNavItem = {
  title: string;
  path?: string;
  icon?: ReactNode;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
  {
    label: "General",
    items: [
      {
        title: "New Chat",
        path: "#/chat/new",
        icon: <HugeiconsIcon icon={Add01Icon} className="size-4" />,
      },
      {
        title: "Home",
        path: "#/",
        icon: <HugeiconsIcon icon={Home01Icon} className="size-4" />,
      },
    ],
  },
  {
    label: "History",
    items: [
      {
        title: "Chat History",
        path: "#/chat/history",
        icon: <HugeiconsIcon icon={Time01Icon} className="size-4" />,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        path: "#/settings",
        icon: <HugeiconsIcon icon={Settings01Icon} className="size-4" />,
      },
      {
        title: "Account",
        path: "#/account",
        icon: <HugeiconsIcon icon={UserIcon} className="size-4" />,
      },
    ],
  },
];

export const footerNavLinks: SidebarNavItem[] = [];

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...footerNavLinks,
];
