'use client';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { XCircleIcon } from 'lucide-react';

export default function CancelPage() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) {
      const logCancel = async () => {
        await push(ref(db, `cancellations/${user.uid}`), {
          email: user.email,
          cancelledAt: serverTimestamp(),
        });
      };
      logCancel().catch(console.error);
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto animate-pulse" />
        <h1 className="text-2xl font-semibold mt-4 text-red-700">Payment Cancelled</h1>
        <p className="mt-2 text-gray-600">
          Your transaction was cancelled{user?.email ? `, ${user.email}` : ''}.
        </p>
        <a
          href="/shop"
          className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded transition"
        >
          Return to Shop
        </a>
      </div>
    </div>
  );
}
