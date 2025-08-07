'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { get, ref, push, serverTimestamp, child, set } from 'firebase/database';
import { CheckCircleIcon } from 'lucide-react';

export default function SuccessPage() {
  const [user, loading] = useAuthState(auth);
  const [logged, setLogged] = useState(false);
  const [processing, setProcessing] = useState(true);
  const [productName, setProductName] = useState('');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!loading && user && sessionId && !logged) {
      const verifyAndLog = async () => {
  try {
    const sessionRef = ref(db);
    const snapshot = await get(child(sessionRef, `processedSessions/${sessionId}`));

    if (snapshot.exists()) {
      console.warn('Session already processed, skipping log.');
      setProcessing(false);
      return;
    }

    const res = await fetch('/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();
    console.log(data);

    if (data?.productId && data?.priceId) {
      const orderRef = push(ref(db, `purchases/${user.uid}`));
const orderId = orderRef.key!;

await set(orderRef, {
  email: data.email,
  productId: data.productId,
  productName: data.productName,
  priceId: data.priceId,
  purchasedAt: serverTimestamp(),
  resolved: false,
});


      // Mark session as processed
      await push(ref(db, `processedSessions/${sessionId}`), {
        userId: user.uid,
        usedAt: serverTimestamp(),
      });

      await fetch('/api/send-receipt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: data.email,
    orderId,
    productName: data.productName,
    priceId: data.priceId,

  }),
});


      setProductName(data.productName);
      setLogged(true);
    }
  } catch (err) {
    console.error('Error verifying/logging:', err);
  } finally {
    setProcessing(false);
  }
};


      verifyAndLog();
    } else if (!loading && !sessionId) {
      setProcessing(false); // no session ID
    }
  }, [user, loading, sessionId, logged]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center px-6">
      {processing ? (
        <div className="flex flex-col items-center justify-center text-green-700">
          <div className="loader mb-4" />
          <p className="text-lg font-medium">Processing your purchase...</p>
        </div>
      ) : (
        <div className="relative backdrop-blur-md bg-white/70 border border-green-200 shadow-xl rounded-3xl p-10 max-w-md w-full text-center animate-fade-in">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-100 rounded-full p-2 shadow-md">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-green-700 mt-8">
            Payment Successful!
          </h1>
          <p className="mt-3 text-gray-700">
            Thank you{user?.email ? `, ${user.email}` : ''} for your purchase.
          </p>

          {productName && (
            <p className="mt-2 text-sm text-gray-500 italic">
              Product: <span className="font-medium text-gray-700">{productName}</span>
            </p>
          )}

          <a
            href="/shop"
            className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition shadow-md"
          >
            Back to Shop
          </a>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

      `}</style>
    </div>
  );
}
