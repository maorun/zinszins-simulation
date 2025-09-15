import * as React from "react"

import { cn } from "../../lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  nestingLevel?: number;
}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, nestingLevel = 0, ...props }, ref) => {
  // Mobile-first responsive spacing based on nesting level
  const nestingClasses = React.useMemo(() => {
    switch (nestingLevel) {
      case 0: // Top level cards
        return "rounded-xl border bg-card text-card-foreground shadow-sm";
      case 1: // First level nested cards - reduced padding on mobile
        return "rounded-lg border bg-card text-card-foreground shadow-sm sm:shadow-md mx-1 sm:mx-0 bg-gray-50/30";
      case 2: // Second level nested cards - minimal padding, lighter borders  
        return "rounded-md border border-gray-200 bg-gray-50/60 text-card-foreground shadow-none mx-2 sm:mx-1 sm:shadow-sm";
      case 3: // Third level nested cards - very minimal styling
        return "rounded border border-gray-100 bg-gray-100/80 text-card-foreground shadow-none mx-3 sm:mx-2 border-l-4 border-l-gray-300";
      case 4: // Fourth level nested cards - border only with more indentation
        return "rounded border-l-4 border-l-blue-200 bg-blue-50/30 text-card-foreground shadow-none mx-4 sm:mx-3 pl-4 sm:pl-6";
      default: // Fifth level and beyond - distinct visual separation
        return "border-l-4 border-l-orange-200 bg-orange-50/20 text-card-foreground shadow-none mx-5 sm:mx-4 pl-4 sm:pl-6 rounded-md";
    }
  }, [nestingLevel]);

  return (
    <div
      ref={ref}
      className={cn(nestingClasses, className)}
      data-nesting-level={nestingLevel}
      {...props}
    />
  );
})
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  nestingLevel?: number;
}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  CardHeaderProps
>(({ className, nestingLevel = 0, ...props }, ref) => {
  // Progressive padding reduction for mobile
  const nestingClasses = React.useMemo(() => {
    switch (nestingLevel) {
      case 0: // Top level headers - full padding
        return "flex flex-col space-y-1.5 p-4 sm:p-6";
      case 1: // First level nested - slightly reduced
        return "flex flex-col space-y-1.5 p-3 sm:p-4";
      case 2: // Second level nested - more reduced
        return "flex flex-col space-y-1 p-2 sm:p-3";
      case 3: // Third level nested - minimal padding
        return "flex flex-col space-y-1 p-2 sm:p-2";
      default: // Fourth level and beyond - very minimal
        return "flex flex-col space-y-0.5 p-1 sm:p-2";
    }
  }, [nestingLevel]);

  return (
    <div
      ref={ref}
      className={cn(nestingClasses, className)}
      {...props}
    />
  );
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  nestingLevel?: number;
}

const CardContent = React.forwardRef<
  HTMLDivElement,
  CardContentProps
>(({ className, nestingLevel = 0, ...props }, ref) => {
  // Progressive padding reduction for mobile
  const nestingClasses = React.useMemo(() => {
    switch (nestingLevel) {
      case 0: // Top level content - full padding
        return "p-4 pt-0 sm:p-6 sm:pt-0";
      case 1: // First level nested - slightly reduced
        return "p-3 pt-0 sm:p-4 sm:pt-0";
      case 2: // Second level nested - more reduced
        return "p-2 pt-0 sm:p-3 sm:pt-0";
      case 3: // Third level nested - minimal padding
        return "p-2 pt-0 sm:p-2 sm:pt-0";
      default: // Fourth level and beyond - very minimal
        return "p-1 pt-0 sm:p-2 sm:pt-0";
    }
  }, [nestingLevel]);

  return (
    <div ref={ref} className={cn(nestingClasses, className)} {...props} />
  );
})
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  nestingLevel?: number;
}

const CardFooter = React.forwardRef<
  HTMLDivElement,
  CardFooterProps
>(({ className, nestingLevel = 0, ...props }, ref) => {
  // Progressive padding reduction for mobile
  const nestingClasses = React.useMemo(() => {
    switch (nestingLevel) {
      case 0: // Top level footer - full padding
        return "flex items-center p-4 pt-0 sm:p-6 sm:pt-0";
      case 1: // First level nested - slightly reduced
        return "flex items-center p-3 pt-0 sm:p-5 sm:pt-0";
      case 2: // Second level nested - more reduced
        return "flex items-center p-2 pt-0 sm:p-4 sm:pt-0";
      case 3: // Third level nested - minimal padding
        return "flex items-center p-2 pt-0 sm:p-3 sm:pt-0";
      default: // Fourth level and beyond - very minimal
        return "flex items-center p-1 pt-0 sm:p-2 sm:pt-0";
    }
  }, [nestingLevel]);

  return (
    <div
      ref={ref}
      className={cn(nestingClasses, className)}
      {...props}
    />
  );
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
