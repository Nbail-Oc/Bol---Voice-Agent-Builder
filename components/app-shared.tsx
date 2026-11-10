import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	DashboardSquare01Icon,
	Analytics01Icon,
	ShoppingCart01Icon,
	File01Icon,
	UserGroupIcon,
	Megaphone01Icon,
	Settings01Icon,
	CreditCardIcon,
	HelpCircleIcon,
	Activity01Icon,
} from "@hugeicons/core-free-icons";

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
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "#/dashboard",
				icon: <HugeiconsIcon icon={DashboardSquare01Icon} className="size-4" />,
			},
			{
				title: "Sales",
				path: "#/sales",
				icon: <HugeiconsIcon icon={Analytics01Icon} className="size-4" />,
			},
		],
	},
	{
		label: "Store",
		items: [
			{
				title: "Orders",
				path: "#/orders",
				icon: <HugeiconsIcon icon={ShoppingCart01Icon} className="size-4" />,
				subItems: [
					{ title: "All orders", path: "#/orders/all" },
					{ title: "Unfulfilled", path: "#/orders/unfulfilled" },
					{ title: "Returns", path: "#/orders/returns" },
				],
			},
			{
				title: "Products",
				path: "#/products",
				icon: <HugeiconsIcon icon={File01Icon} className="size-4" />,
				subItems: [
					{ title: "Catalog", path: "#/products/catalog" },
					{ title: "Inventory", path: "#/products/inventory" },
					{ title: "Collections", path: "#/products/collections" },
				],
			},
			{
				title: "Customers",
				path: "#/customers",
				icon: <HugeiconsIcon icon={UserGroupIcon} className="size-4" />,
			},
			{
				title: "Marketing",
				path: "#/marketing",
				icon: <HugeiconsIcon icon={Megaphone01Icon} className="size-4" />,
			},
		],
	},
	{
		label: "Administration",
		items: [
			{
				title: "Settings",
				path: "#/settings",
				icon: <HugeiconsIcon icon={Settings01Icon} className="size-4" />,
			},
			{
				title: "Billing",
				path: "#/billing",
				icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4" />,
				subItems: [
					{ title: "Plan", path: "#/billing/plan" },
					{ title: "Invoices", path: "#/billing/invoices" },
					{ title: "Payment methods", path: "#/billing/payment-methods" },
				],
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Seller help",
		path: "#/seller-help",
		icon: <HugeiconsIcon icon={HelpCircleIcon} className="size-4" />,
	},
	{
		title: "Platform status",
		path: "#/status",
		icon: <HugeiconsIcon icon={Activity01Icon} className="size-4" />,
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
