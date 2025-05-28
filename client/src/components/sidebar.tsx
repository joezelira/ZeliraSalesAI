import { Link, useLocation } from "wouter";
import { Bot, BarChart3, Users, Mail, Calendar, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Email Templates", href: "/templates", icon: Mail },
  { name: "Scheduled Calls", href: "/calls", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow-sm border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sophie</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI Sales Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.name === "Leads" && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                        12
                      </span>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              Sarah Johnson
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Sales Manager
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
