import type { ReactNode } from "react";
import React from "react";

interface ThinLayoutProps {
  title?: string;
  classNames?: string;
  children?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "6xl";
  padding?: boolean;
}

const ThinLayout = React.forwardRef<HTMLDivElement, ThinLayoutProps>(
  (props, ref) => {
    const {
      children,
      title,
      classNames,
      maxWidth = "6xl",
      padding = true,
    } = props;

    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "6xl": "max-w-6xl",
    };

    return (
      <section
        ref={ref}
        className={`container mx-auto max-w-7xl ${maxWidthClasses[maxWidth]} ${classNames || ""} ${padding ? "px-4 py-8" : ""}`}
      >
        {title && (
          <h1 className="mb-6 text-center font-bold text-2xl">{title}</h1>
        )}
        {children}
      </section>
    );
  },
);

ThinLayout.displayName = "ThinLayout";

export default ThinLayout;
