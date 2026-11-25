import React from "react";

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  pill?: boolean;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = "",
  pill = true,
  ...props
}) => {
  return (
    <div
      className={`glass ${pill ? "rounded-full" : "rounded-[28px]"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
