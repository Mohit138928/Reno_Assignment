import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function AddSchool() {
  // Form validation with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // State for form submission status and feedback
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    success: false,
    message: "",
  });

  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);

  // Handle image change for preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    setStatus({ ...status, submitting: true });

    try {
      // Create FormData object to send form data with file
      const formData = new FormData();

      // Append text fields
      formData.append("name", data.name);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("contact", data.contact);
      formData.append("email_id", data.email_id);

      // Append image file
      formData.append("image", data.image[0]);

      // Send POST request to API
      const response = await fetch("/api/addSchool", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Success - reset form and show success message
        reset();
        setImagePreview(null);
        setStatus({
          submitting: false,
          submitted: true,
          success: true,
          message: result.message || "School added successfully!",
        });
      } else {
        // API returned errors
        setStatus({
          submitting: false,
          submitted: true,
          success: false,
          message: result.message || "Failed to add school. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({
        submitting: false,
        submitted: true,
        success: false,
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>Add School</title>
        <meta name="description" content="Add a new school to the database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New School
          </h1>
          <p className="text-gray-600">
            Fill in the details below to add a new school to the database.
          </p>
          <div className="mt-4">
            <Link
              href="/showSchools"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Schools →
            </Link>
          </div>
        </div>

        {/* Status Message */}
        {status.submitted && (
          <div
            className={`mb-8 p-4 rounded-md ${
              status.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">{status.message}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-md rounded-lg overflow-hidden"
        >
          <div className="px-6 py-8">
            {/* School Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                School Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "School name is required" })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Enter school name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* School Address */}
            <div className="mb-6">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address <span className="text-red-600">*</span>
              </label>
              <textarea
                id="address"
                {...register("address", { required: "Address is required" })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.address
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                rows="3"
                placeholder="Enter complete address"
              ></textarea>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* City & State - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  {...register("city", { required: "City is required" })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.city
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  {...register("state", { required: "State is required" })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.state
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact & Email - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="contact"
                  {...register("contact", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Contact must be a 10-digit number",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.contact
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="10-digit number"
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contact.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email_id"
                  {...register("email_id", {
                    required: "Email address is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email_id
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="school@example.com"
                />
                {errors.email_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* School Image */}
            <div className="mb-6">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                School Image <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                id="image"
                {...register("image", {
                  required: "School image is required",
                  onChange: handleImageChange,
                })}
                accept="image/png, image/jpeg, image/jpg, image/gif"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.image.message}
                </p>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <div className="w-32 h-32 relative border rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                reset();
                setImagePreview(null);
                setStatus({
                  submitting: false,
                  submitted: false,
                  success: false,
                  message: "",
                });
              }}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={status.submitting}
              className="bg-blue-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {status.submitting ? "Submitting..." : "Add School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
