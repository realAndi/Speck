import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export const RecentlyPurchased: React.FC = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Recently Purchased</h3>
      <div className="space-y-8">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">Office Supplies</p>
            <p className="text-sm text-muted-foreground">Paper, pens, etc.</p>
          </div>
          <div className="ml-auto font-medium">$149.99</div>
        </div>
        <div className="flex items-center">
          <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
            <AvatarImage src="/avatars/02.png" alt="Avatar" />
            <AvatarFallback>EM</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">Equipment Maintenance</p>
            <p className="text-sm text-muted-foreground">Printer repair</p>
          </div>
          <div className="ml-auto font-medium">$299.00</div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="Avatar" />
            <AvatarFallback>MT</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">Marketing Tools</p>
            <p className="text-sm text-muted-foreground">Social media ads</p>
          </div>
          <div className="ml-auto font-medium">$499.99</div>
        </div>
        {/* Add more recently purchased items */}
      </div>
    </div>
  );
};