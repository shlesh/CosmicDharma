import React from "react";
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="page-wrapper flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="text-blue-600 underline">
        Go back home
      </Link>
    </main>
  );
}
