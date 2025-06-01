// app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <h1 className="text-4xl font-bold mb-6">Cennik Vet</h1>
      <p className="text-lg mb-8 text-gray-600">
        Zarządzaj usługami, klientami, fakturami i konfiguracją offline.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/clients">
          <button className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            Klienci
          </button>
        </Link>

        <Link href="/products">
          <button className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700">
            Produkty
          </button>
        </Link>

        <Link href="/transactions">
          <button className="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700">
            Faktury
          </button>
        </Link>

        <Link href="/transactions/calendar">
          <button className="w-full py-3 bg-amber-600 text-white rounded hover:bg-amber-700">
            Kalendarz
          </button>
        </Link>

        <Link href="/settings">
          <button className="w-full py-3 bg-gray-700 text-white rounded hover:bg-gray-800">
            Ustawienia
          </button>
        </Link>
      </div>
    </div>
  );
}
