import { Link, useLocation } from '@tanstack/react-router'
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  Building2,
  FileText,
  FolderIcon,
  Home,
  LayoutDashboardIcon,
  LayoutGrid,
  Mail,
  Map,
  Milestone,
  SettingsIcon,
  User,
  UsersIcon,
} from "lucide-react"

import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { MdOutlineRealEstateAgent } from "react-icons/md";
import { useQueriesStore } from '@/store/queriesStore'; // Import the store
import { Badge } from "@/components/ui/badge"; // Assuming a Badge component exists

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Properties",
    url: "/dashboard/properties",
    icon: Home,
  },
  {
    title: "Maps",
    url: "/dashboard/maps",
    icon: Map,
  },
  {
    title: "Files",
    url: "/dashboard/files",
    icon: FileText,
  },
  {
    title: "Cities",
    url: "/dashboard/cities",
    icon: Building2,
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: LayoutGrid,
  },
  {
    title: "Phases",
    url: "/dashboard/phases",
    icon: Milestone,
  },
  {
    title: "Societies",
    url: "/dashboard/societies",
    icon: UsersIcon,
  },
]

const secondaryNavItems = [
  {
    title: "Settings",
    url: "#",
    icon: SettingsIcon,
  },
  {
    title: "Landing Page",
    url: "/dashboard/landing-page",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Queries",
    url: "/dashboard/queries",
    icon: Mail,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: UsersIcon,
  },
]

const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
  },
}


import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar

export function AppSidebar({
  ...props
}) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar(); // Use useSidebar hook
  const unreadQueriesCount = useQueriesStore((state) => state.getUnreadQueriesCount());

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link t0="/" className="flex items-center gap-2 font-medium">
                          <div className="flex items-center justify-center bg-transparent rounded-md text-primary-foreground size-6">
                            <MdOutlineRealEstateAgent className="text-primary" style={{ width: 24, height: 24 }} />
                          </div>
                          The Zalmi Marketing
                        </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url} onClick={() => isMobile && setOpenMobile(false)}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={location.pathname === item.url}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarMenu className="mt-auto">
          {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url} onClick={() => isMobile && setOpenMobile(false)} className="relative">
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={location.pathname === item.url}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.title === "Queries" && unreadQueriesCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadQueriesCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} isMobile={isMobile} setOpenMobile={setOpenMobile} />
      </SidebarFooter>
    </Sidebar>
  );
}
