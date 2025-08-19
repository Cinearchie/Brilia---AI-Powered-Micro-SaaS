"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";

function EnsurePrismaUser() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id }),
      });
    }
  }, [user]);

  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState<number>(0);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const fetchCoins = () => {
        fetch("/api/coin-add")
          .then((res) => res.json())
          .then((data) => setCoins(data.coins));
      };
  
      fetchCoins(); // initial fetch
      const interval = setInterval(fetchCoins, 3000); // refresh every 3s
  
      return () => clearInterval(interval);
    }
  }, [user]);
  

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="drawer-content flex flex-col">
      <EnsurePrismaUser />
      <header className="fixed top-0 left-0 w-full z-60">
        <Navbar shouldHideOnScroll className="bg-white text-gray-800 px-6 pt-2">
          <NavbarBrand>
            <Image src="/logo.jpg" alt="Logo" width={40} height={40} />
            <p className="font-bold text-gray-700 ml-2 text-4xl mt-1">Brilia</p>
          </NavbarBrand>
          <NavbarContent justify="end">
            {!user ? (
              <>
                <NavbarItem className="hidden lg:flex">
                  <Link className="text-gray-500 hover:text-black" href="/sign-in">
                    Login
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link className="text-gray-700 hover:text-black" href="/sign-up">
                    Sign Up
                  </Link>
                </NavbarItem>
              </>
            ) : (
              <>
                <NavbarItem className="hidden lg:flex">
                  <p className="text-gray-600 mr-4">
                    Hi, {user.firstName} • 💰 {coins}
                  </p>
                </NavbarItem>
                <NavbarItem>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-black"
                  >
                    Sign Out
                  </button>
                </NavbarItem>
              </>
            )}
          </NavbarContent>
        </Navbar>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-8">
          {children}
        </div>
      </main>
    </div>
  );
}
