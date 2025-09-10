import type { ReactNode } from "react";
import React from "react";
import { Label } from "../ui/label";

interface WideContainerProps {
  title?: string;
  classNames?: string;
  children?: ReactNode;
  ultraWide?: boolean;
  padding?: boolean;
  id?: string;
}

const WideContainer = React.forwardRef<HTMLDivElement, WideContainerProps>(
  (props, ref) => {
    const {
      children,
      title,
      classNames,
      ultraWide = false,
      padding,
      id,
    } = props;
    return (
      <section
        ref={ref}
        id={id}
        className={`container mx-auto text-center${ultraWide ? "w-[1600px] sm:px-16" : " "} ${classNames || ""} ${padding ? "px-4 py-24" : ""}`}
      >
        {title && (
          <Label className="mb-4 font-semibold text-xl ">{title}</Label>
        )}
        {children}
      </section>
    );
  },
);

export default WideContainer;
