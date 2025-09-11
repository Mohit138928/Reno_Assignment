import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";

export default function Login() {
  const router = useRouter();
  const { login, verifyOtp, isAuthenticated } = useAuth();
  const [step, setStep] = useState("request"); // "request" or "verify"
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // If user is already authenticated, redirect to schools page
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/showSchools");
    }
  }, [isAuthenticated, router]);

  // Handle request OTP
  const handleRequestOTP = async (data) => {
    setStatus({ loading: true, error: "", success: "" });
    setEmail(data.email);

    try {
      const response = await login(data.email);

      if (response.success) {
        setStep("verify");
        setStatus({
          loading: false,
          error: "",
          success: "OTP sent to your email!",
        });
      } else {
        setStatus({
          loading: false,
          error: response.message || "Failed to send OTP. Please try again.",
          success: "",
        });
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      setStatus({
        loading: false,
        error: "An error occurred. Please try again.",
        success: "",
      });
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async (data) => {
    setStatus({ loading: true, error: "", success: "" });

    try {
      const response = await verifyOtp(email, data.otp, data.name);

      if (response.success) {
        setStatus({
          loading: false,
          error: "",
          success: "Login successful! Redirecting...",
        });
        // Redirect to the page user was trying to access, or to showSchools
        const redirectPath = router.query.redirect || "/showSchools";
        setTimeout(() => router.push(redirectPath), 1000);
      } else {
        setStatus({
          loading: false,
          error: response.message || "Invalid OTP. Please try again.",
          success: "",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setStatus({
        loading: false,
        error: "An error occurred. Please try again.",
        success: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>
          {step === "request" ? "Login" : "Verify OTP"} | School Management
        </title>
        <meta name="description" content="Login to School Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === "request" ? "Login to your account" : "Verify your email"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "request" ? (
            <>
              Or{" "}
              <Link
                href="/showSchools"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                browse schools as guest
              </Link>
            </>
          ) : (
            <>
              We sent a 6-digit code to{" "}
              <span className="font-bold">{email}</span>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Status Messages */}
          {status.error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{status.error}</p>
                </div>
              </div>
            </div>
          )}

          {status.success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{status.success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Request OTP Form */}
          {step === "request" && (
            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleRequestOTP)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.email
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status.loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    status.loading
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                >
                  {status.loading ? "Sending..." : "Request OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Verify OTP Form */}
          {step === "verify" && (
            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleVerifyOTP)}
            >
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter 6-digit OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit code"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.otp
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2`}
                    {...register("otp", {
                      required: "OTP is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "OTP must be a 6-digit number",
                      },
                    })}
                  />
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Name (optional)
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                    {...register("name")}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Only required for first-time login
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  ← Back to login
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestOTP({ email })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Resend OTP
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status.loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    status.loading
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                >
                  {status.loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
