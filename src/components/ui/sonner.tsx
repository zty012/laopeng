'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          '--normal-bg': 'hsl(var(--popover))',
          '--normal-border': 'hsl(var(--border))',
          '--normal-text': 'hsl(var(--popover-foreground))',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
