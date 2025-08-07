/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle, ShoppingCart, ShieldCheck, Clock } from "lucide-react";

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
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="loader mb-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center min-h-screen px-6 py-12 sm:px-20 sm:py-20 bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white">
      
      <main className="text-center max-w-3xl space-y-10">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
          All Monster Flavours. One Place.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-lg sm:text-xl">
          Premium energy drinks at unbeatable prices. No subscriptions. No markup.
        </p>

        {/* Features List */}

<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10">
  <Card className="bg-zinc-900 text-white border-zinc-700 shadow-md">
    <CardHeader className="flex flex-row items-center gap-4">
      <CheckCircle className="text-lime-400 w-6 h-6" />
      <CardTitle className="text-lg font-semibold">All Flavours In Stock</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-300">
      Every Monster Energy flavour is always available. No stockouts.
    </CardContent>
  </Card>

  <Card className="bg-zinc-900 text-white border-zinc-700 shadow-md">
    <CardHeader className="flex flex-row items-center gap-4">
      <ShoppingCart className="text-lime-400 w-6 h-6" />
      <CardTitle className="text-lg font-semibold">Lowest Prices</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-300">
      Get your favourite energy drinks cheaper than any store.
    </CardContent>
  </Card>

  <Card className="bg-zinc-900 text-white border-zinc-700 shadow-md">
    <CardHeader className="flex flex-row items-center gap-4">
      <ShieldCheck className="text-lime-400 w-6 h-6" />
      <CardTitle className="text-lg font-semibold">Secure Checkout</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-300">
      All purchases are processed safely through Stripe.
    </CardContent>
  </Card>

  <Card className="bg-zinc-900 text-white border-zinc-700 shadow-md">
    <CardHeader className="flex flex-row items-center gap-4">
      <Clock className="text-lime-400 w-6 h-6" />
      <CardTitle className="text-lg font-semibold">Instant Confirmation</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-300">
      Your order is confirmed immediately and ready for delivery.
    </CardContent>
  </Card>
</div>

        {/* CTA */}
        <Button
          asChild
          size="lg"
          className="mt-6 px-10 py-4 text-lg bg-lime-500 hover:bg-lime-600 text-black font-bold rounded-full shadow-lg transition-all"
        >
          <Link href="/shop">Browse All Flavours</Link>
        </Button>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 space-y-3 mt-20">
        <div className="space-x-6">
          <Link href="/terms" className="hover:text-white underline">Terms</Link>
          <Link href="/privacy" className="hover:text-white underline">Privacy</Link>
          <Link href="/refund" className="hover:text-white underline">Refunds</Link>
        </div>
        <p>
          Questions?{" "}
          <a href="mailto:paul.hodges09@gmail.com" className="hover:text-white underline">
            Contact us
          </a>
        </p>
        <p className="text-gray-600 mt-2">&copy; {new Date().getFullYear()} SnapCart</p>
      </footer>
    </div>
  );
}
