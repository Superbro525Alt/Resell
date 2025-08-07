/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader mb-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center min-h-screen px-6 py-12 sm:px-20 sm:py-20 bg-gradient-to-br from-white to-gray-100">
      <main className="text-center max-w-2xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Welcome to <span className="text-gradient bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SnapCart</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Discover premium digital products that supercharge your productivity.
        </p>
        <ul className="space-y-2 text-left text-gray-700 list-inside list-disc text-md">
          <li>Instant delivery via email</li>
          <li>Secure Stripe checkout</li>
          <li>No subscriptions - just one-time payments</li>
        </ul>
        <Button asChild size="lg" className="mt-4 px-8 py-3">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </main>

      <footer className="text-center text-sm text-gray-500 space-y-3">
        <div className="space-x-6">
          <Link href="/terms" className="hover:text-gray-700 underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-gray-700 underline">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-gray-700 underline">Refund Policy</Link>
        </div>
        <p>
          Need help?{" "}
          <a href="mailto:paul.hodges09@gmail.com" className="hover:text-gray-700 underline">
            Contact us
          </a>
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} SnapCart</p>
      </footer>
    </div>
  );
}
