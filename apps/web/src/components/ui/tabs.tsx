"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./separator";

export interface TabsProps
  extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsContextProps {
  value: string | undefined;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps>({
  value: undefined,
  onValueChange: undefined,
});

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & TabsProps
>(({ className, children, ...props }, ref) => {
  return (
    <TabsContext.Provider value={{ value: props.value, onValueChange: props.onValueChange }}>
      <div
        className={cn("inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)]", className)}
        ref={ref}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

interface TabsListProps extends React.ComponentPropsWithoutRef<"div"> {}
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md gap-1 bg-background p-1",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
}
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;
    return (
      <button
        onClick={() => context.onValueChange?.(value)}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-[var(--brand)]",
          className
        )}
        ref={ref}
        data-state={isActive ? "active" : "inactive"}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
}
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;
    return (
      <div
        className={cn("mt-2", className)}
        ref={ref}
        {...props}
      >
        {isActive ? (
          <>
            <Separator className="h-0 w-full mb-2" />
            {children}
          </>
        ) : null}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
