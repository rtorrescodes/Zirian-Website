'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ClickableRowProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ClickableRow({ href, children, className }: ClickableRowProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent routing if the user clicked on a link or button inside the row
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    router.push(href);
  };

  return (
    <tr 
      onClick={handleClick} 
      className={`cursor-pointer ${className || ''}`}
    >
      {children}
    </tr>
  );
}
