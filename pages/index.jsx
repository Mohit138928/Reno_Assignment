import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  // Redirect to the showSchools page
  useEffect(() => {
    router.push("/showSchools");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Head>
        <title>School Management System</title>
        <meta name="description" content="School Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
