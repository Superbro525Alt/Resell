'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Header } from '@/components/AuthBar';

type Product = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: {
    id: string;
    unit_amount: number;
    currency: string;
  };
};

type Square = {
  top: string;
  left: string;
  delay: string;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, loading] = useAuthState(auth);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const router = useRouter();

  const [squares, setSquares] = useState<Square[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
    }));
    setSquares(generated);
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoadingProducts(false);
      });
  }, []);

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const handleCheckout = async (priceId: string, productId: string) => {
    setLoadingCheckout(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, productId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoadingCheckout(false);
      alert('Error: ' + (data.error || 'Checkout failed.'));
    }

  };

  if (loading || loadingCheckout) {
    return (
        <div className="flex justify-center items-center min-h-[100vh]">
      <div className="loader mb-4" />
      </div>
    );
  }


  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-8">
      <Header />
      {/* Floating background squares */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {squares.map((square, i) => (
          <div
            key={i}
            className="absolute w-12 h-12 bg-white/10 dark:bg-white/5 rounded-sm blur-md animate-square"
            style={{
              top: square.top,
              left: square.left,
              animationDelay: square.delay,
            }}
          />
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-15">
        {isLoadingProducts
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="relative overflow-hidden rounded-3xl shadow-lg backdrop-blur-lg bg-white/30 dark:bg-muted/50 border border-border"
              >
                <div className="relative h-48 bg-gray-200 animate-pulse" />
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded" />
                </CardFooter>
              </Card>
            ))
          : products.map((product) => (
              <Card
                key={product.id}
                className={cn(
                  'relative rounded-3xl bg-white/70 dark:bg-muted/70 shadow-lg border border-border overflow-hidden transition-transform duration-300',
                  'hover:scale-105 hover:shadow-xl'
                )}
              >
                {/* Image & Badge */}
                <div className="relative overflow-hidden h-48">
                  {product.image ? (
                    <>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        No image available
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-indigo-600 text-xs text-white px-2 py-1 rounded">
                    New
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-3 text-muted-foreground">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(
                      product.price.unit_amount,
                      product.price.currency
                    )}
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() =>
                      handleCheckout(product.price.id, product.id)
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-shadow shadow-lg hover:shadow-indigo-500/40"
                  >
                    Buy "{product.name}"
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes floatX {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(30px);
          }
        }
        @keyframes floatY {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(30px);
          }
        }
        .animate-square {
          animation: floatX 10s ease-in-out infinite alternate,
            floatY 12s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
