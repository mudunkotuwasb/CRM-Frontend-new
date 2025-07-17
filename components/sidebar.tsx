"use client"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Phone, BarChart3, Settings, LogOut, UserPlus, Download } from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Phone, label: "All Contacts", href: "/all-contacts" },
    { icon: Phone, label: "My Contacts", href: "/contacts" },
    { icon: UserPlus, label: "Users", href: "/users" },
    { icon: BarChart3, label: "Team Stats", href: "/stats" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Download, label: "Import/Export", href: "/import-export" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const staffMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Phone, label: "All Contacts", href: "/all-contacts" },
    { icon: Phone, label: "My Contacts", href: "/contacts" },
    { icon: BarChart3, label: "My Stats", href: "/stats" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
  ]

  const menuItems = userRole === "admin" ? adminMenuItems : staffMenuItems

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Sales CRM</h2>
        <p className="text-sm text-gray-600 capitalize">{userRole} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
