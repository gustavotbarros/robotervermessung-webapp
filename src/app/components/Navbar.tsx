'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Typography } from '@/src/components/Typography';

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="h-full bg-gray-200 md:h-navbarheight lg:h-navbarheight">
      <div className="flex flex-row flex-wrap items-center gap-10 px-6 py-4">
        <Link href="/">
          <div className="items-center rounded-md p-2">
            <Typography as="h1">robotervermessung</Typography>
          </div>
        </Link>
        <Link href="/dashboard">
          <Typography
            as="h2"
            className={`my-0 items-center rounded-md p-2 transition-colors duration-200 ease-in betterhover:hover:bg-gray-300 ${
              pathname.includes('dashboard') ? 'bg-gray-300' : ''
            }`}
          >
            dashboard
          </Typography>
        </Link>
        <Link href="/trajectories">
          <Typography
            as="h2"
            className={`my-0 items-center rounded-md p-2 transition-colors duration-200 ease-in betterhover:hover:bg-gray-300 ${
              pathname.includes('trajectories') ? 'bg-gray-300' : ''
            }`}
          >
            bewegungsdaten
          </Typography>
        </Link>
        <Link
          className="ml-auto"
          href="https://www.lps.ruhr-uni-bochum.de/lps/index.html.de"
        >
          <Image
            className="my-0 items-center self-end rounded-md p-1"
            src="/lps.png"
            width={70}
            height={70}
            alt="LPS-Logo"
          />
        </Link>
      </div>
    </header>
  );
};