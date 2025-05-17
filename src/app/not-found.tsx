"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="mt-8 px-4 py-2 bg-blue-500 text-white rounded">
        Go back home
      </Link>
    </div>
  );
}
