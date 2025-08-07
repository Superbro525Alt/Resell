/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { ref, onValue, push, set, update } from 'firebase/database';
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Receipt, LogOut, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { createStripeProduct } from '@/app/actions/create-stripe-product';

type Order = {
  id: string;
  productName: string;
  priceId: string;
  purchasedAt: number;
  amount?: number;
  currency?: string;
  resolved: boolean;
  uid?: string;
  email: string;
};

type Suggestion = {
  id: string;
  name: string;
  approved: boolean;
  suggestedAt: number;
};

export function Header() {
  const [user] = useAuthState(auth);
  const [resolvedOrders, setResolvedOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [productName, setProductName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [priceValue, setPriceValue] = useState('');

  useEffect(() => {
    if (!user) return;

    // Check if user is admin
    const userRef = ref(db, `users/${user.uid}/isAdmin`);
    onValue(userRef, (snapshot) => {
      setIsAdmin(snapshot.val() === true);
    });

    // Get current user's orders
    const ordersRef = ref(db, `purchases/${user.uid}`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));
        setResolvedOrders(orderList.reverse().filter((ord) => ord.resolved));
        setActiveOrders(orderList.reverse().filter((ord) => !ord.resolved));
      } else {
        setResolvedOrders([]);
        setActiveOrders([]);
      }
    });

    // If admin, load all suggested products & all user orders
    if (isAdmin) {
      const suggestionsRef = ref(db, 'suggestedProducts');
      onValue(suggestionsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const suggestionList = Object.entries(data).map(([id, value]: any) => ({ id, ...value }));
        setSuggestions(suggestionList);
      });

      const purchasesRef = ref(db, 'purchases');
      onValue(purchasesRef, (snapshot) => {
        const all = snapshot.val() || {};
        const orderList: Order[] = [];
        for (const [uid, orders] of Object.entries(all)) {
          for (const [id, order] of Object.entries(orders as object)) {
            orderList.push({ ...(order as Order), id, uid });
          }
        }
        setAllOrders(orderList.reverse());
      });
    }
  }, [user, isAdmin]);

  const suggestProduct = async () => {
    const suggestedRef = push(ref(db, 'suggestedProducts'));
    await set(suggestedRef, {
      name: productName,
      price: 0,
      approved: false,
      suggestedAt: Date.now(),
    });
    setProductName('');
  };

  const approveSuggestion = async () => {
  if (!selectedSuggestion) return;
  const price = parseFloat(priceValue);
  if (isNaN(price) || price <= 0) {
    alert("Invalid price. Try again.");
    return;
  }

  try {
    const { productId, priceId } = await createStripeProduct(selectedSuggestion.name, price);

    await update(ref(db, `suggestedProducts/${selectedSuggestion.id}`), {
      approved: true,
      stripeProductId: productId,
      stripePriceId: priceId,
      price,
    });

    setPriceDialogOpen(false);
    setPriceValue('');
    setSelectedSuggestion(null);
    alert("Product added to Stripe and approved.");
  } catch (err: any) {
    console.error(err);
    alert("Failed to add to Stripe.");
  }
};


  const toggleOrderResolved = (uid: string, orderId: string, current: boolean) => {
    update(ref(db, `purchases/${uid}/${orderId}`), { resolved: !current });
  };

  if (!user) return null;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl backdrop-blur-md bg-white/70 dark:bg-muted/60 border border-border shadow-md px-4 py-3 flex flex-col sm:flex-row flex-wrap sm:items-center gap-4 sm:gap-6 max-w-full sm:max-w-4xl w-[95%] sm:w-full justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.photoURL ?? undefined} />
          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-sm leading-tight">
          <p className="font-medium">{user.email}</p>
          <p className="text-muted-foreground text-xs">Welcome back</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5">

        {/* Suggest Product Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Suggestion</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggest New Product</DialogTitle>
              <DialogDescription>
                Suggest a product to be approved and added to Stripe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product Name"
                  className='mt-2'
                />
              </div>
              <Button className="w-full" onClick={suggestProduct}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Orders Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Orders
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
                    <DialogHeader>
            <DialogTitle className="text-lg">Your Orders</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              View your past and active purchases.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="past" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>

            <TabsContent value="past">
            {resolvedOrders.length === 0 ? (
  <p className="text-sm text-gray-500 italic">No past orders found.</p>
) : (
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {resolvedOrders.map((order) => (
      <div key={order.id}
           className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-lg shadow hover:shadow-md transition p-4">
        <div className="flex items-start sm:items-center space-x-4">
          {/* Optional product image */}
          {/* <img src={order.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover" /> */}
          <div>
            <p className="text-lg font-semibold text-gray-900">{order.productName}</p>
            <p className="text-xs text-gray-600 mt-1">
              Order ID: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{order.priceId}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(order.purchasedAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end mt-3 sm:mt-0">
          {order.amount != null && order.currency && (
            <span className="text-base font-medium text-blue-600">
              { (order.amount / 100).toFixed(2) } {order.currency.toUpperCase()}
            </span>
          )}
          {/* Example status badge */}
          <span className="mt-1 inline-block text-xs font-medium text-white bg-green-500 rounded-full px-2 py-0.5">
            {/* order.status */}
            Delivered
          </span>
        </div>
      </div>
    ))}
  </div>
)}

            </TabsContent>

            <TabsContent value="active">
                        {activeOrders.length === 0 ? (
  <p className="text-sm text-gray-500 italic">No active orders found.</p>
) : (
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {resolvedOrders.map((order) => (
      <div key={order.id}
           className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-lg shadow hover:shadow-md transition p-4">
        <div className="flex items-start sm:items-center space-x-4">
          {/* Optional product image */}
          {/* <img src={order.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover" /> */}
          <div>
            <p className="text-lg font-semibold text-gray-900">{order.productName}</p>
            <p className="text-xs text-gray-600 mt-1">
              Order ID: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{order.priceId}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(order.purchasedAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end mt-3 sm:mt-0">
          {order.amount != null && order.currency && (
            <span className="text-base font-medium text-blue-600">
              { (order.amount / 100).toFixed(2) } {order.currency.toUpperCase()}
            </span>
          )}
          {/* Example status badge */}
          <span className="mt-1 inline-block text-xs font-medium text-white bg-green-500 rounded-full px-2 py-0.5">
            {/* order.status */}
           Not Delivered 
          </span>
        </div>
      </div>
    ))}
  </div>
)}

            </TabsContent>
          </Tabs>
          </DialogContent>
        </Dialog>

        {/* Admin Panel Dialog */}
        {isAdmin && (
          <>
<Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Approve Product</DialogTitle>
      <DialogDescription>
        Enter the price (in USD) for &quot;{selectedSuggestion?.name}&quot;.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Price (USD)</Label>
        <Input
          type="number"
          value={priceValue}
          onChange={(e) => setPriceValue(e.target.value)}
          placeholder="e.g. 19.99"
          className="mt-2"
        />
      </div>
      <Button className="w-full" onClick={approveSuggestion}>Confirm & Add to Stripe</Button>
    </div>
  </DialogContent>
</Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Admin Controls</DialogTitle>
                <DialogDescription>Approve suggestions or mark orders as delivered.</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Suggestions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {suggestions.map((s) => (
                    <div key={s.id} className="border p-2 rounded flex justify-between items-center">
                      <span>{s.name}</span>
                      {s.approved ? (
                        <span className="text-green-600 text-sm font-medium">Approved</span>
                      ) : (
                        <Button size="sm" onClick={() => {
                                            setSelectedSuggestion(s);
                  setPriceDialogOpen(true);
                        }}>Approve</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">All Orders</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allOrders.map((o) => (
                    <div key={o.id} className="border p-2 rounded flex justify-between items-center text-sm">
                      <div>
                              <p className="font-medium text-gray-900">{o.productName}</p>
        <p className="text-xs text-muted-foreground">{o.email}</p>
        <p className="text-xs text-muted-foreground font-mono">{o.priceId}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => toggleOrderResolved(o.uid!, o.id, o.resolved)}>
                        Mark as {o.resolved ? 'Not Delivered' : 'Delivered'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Approve Product</DialogTitle>
      <DialogDescription>
        Enter the price for &quot;{selectedSuggestion?.name}&quot;.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Price</Label>
        <Input
          type="number"
          value={priceValue}
          onChange={(e) => setPriceValue(e.target.value)}
          placeholder="e.g. 19.99"
          className="mt-2"
        />
      </div>
      <Button className="w-full" onClick={approveSuggestion}>Confirm & Add to Stripe</Button>
    </div>
  </DialogContent>
</Dialog>
</>

        )}

        {/* Sign Out */}
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => signOut(auth)}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
