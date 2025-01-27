import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    id: 1,
    title: "New Application",
    message: "You have received a new application",
    time: "5 minutes ago"
  },
  {
    id: 2,
    title: "Payment Received",
    message: "Payment successfully processed",
    time: "1 hour ago"
  }
];

export const NotificationsMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="font-medium text-sm">{notification.title}</div>
                <div className="text-sm text-gray-500">{notification.message}</div>
                <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};