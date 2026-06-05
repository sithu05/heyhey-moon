import {
  type LucideIcon,
  FolderIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  StarIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional sub-items rendered as a collapsible submenu. */
  items?: { label: string; href: string }[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Primary navigation, modeled on the Zello "Product" screen. */
export const mainMenu: NavGroup = {
  label: "Main Menu",
  items: [
    { label: "Dashboard", href: "/", icon: LayoutDashboardIcon },
    {
      label: "Product",
      href: "/product",
      icon: PackageIcon,
      items: [
        { label: "Product List", href: "/product" },
        { label: "Categories", href: "/product/categories" },
      ],
    },
    { label: "Orders", href: "/orders", icon: ShoppingCartIcon },
    { label: "Customers", href: "/customers", icon: UsersIcon },
    { label: "Seller", href: "/seller", icon: StoreIcon },
    { label: "File Manager", href: "/files", icon: FolderIcon },
  ],
};

export const favorites: NavGroup = {
  label: "Favorite",
  items: [
    { label: "Logic Wireless Mouse", href: "/favorites/logic-wireless-mouse", icon: StarIcon },
    { label: "PS Controller", href: "/favorites/ps-controller", icon: StarIcon },
    { label: "Ximi Keyboard", href: "/favorites/ximi-keyboard", icon: StarIcon },
  ],
};
