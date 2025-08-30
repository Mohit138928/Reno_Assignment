import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";

export default function ShowSchools() {
  // State for schools data and loading status
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  // State for available filter options
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);

  // Fetch schools data on component mount
  useEffect(() => {
    async function fetchSchools() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/getSchools");

        if (!response.ok) {
          throw new Error("Failed to fetch schools");
        }

        const result = await response.json();

        if (result.success) {
          setSchools(result.data);

          // Extract unique cities and states for filter options
          const uniqueCities = [
            ...new Set(result.data.map((school) => school.city)),
          ].sort();
          const uniqueStates = [
            ...new Set(result.data.map((school) => school.state)),
          ].sort();

          setCities(uniqueCities);
          setStates(uniqueStates);
        } else {
          throw new Error(result.message || "Failed to fetch schools");
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchools();
  }, []);

  // Filter schools based on search term and filters
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Search term filter (case insensitive)
      const matchesSearch =
        searchTerm === "" ||
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.address.toLowerCase().includes(searchTerm.toLowerCase());

      // City filter
      const matchesCity = filterCity === "" || school.city === filterCity;

      // State filter
      const matchesState = filterState === "" || school.state === filterState;

      // Return school only if it matches all active filters
      return matchesSearch && matchesCity && matchesState;
    });
  }, [schools, searchTerm, filterCity, filterState]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCity("");
    setFilterState("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>All Schools</title>
        <meta name="description" content="View all registered schools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Schools</h1>
          <p className="text-gray-600">
            Browse through all registered schools in our database.
          </p>
          <div className="mt-4">
            <Link
              href="/addSchool"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Add New School →
            </Link>
          </div>
        </div>

        {/* Search and Filter Section */}
        {!isLoading && !error && schools.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Schools
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or address..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label
                  htmlFor="cityFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by City
                </label>
                <select
                  id="cityFilter"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label
                  htmlFor="stateFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by State
                </label>
                <select
                  id="stateFilter"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Stats and Reset */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing {filteredSchools.length} of {schools.length} schools
              </div>

              <button
                onClick={resetFilters}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-8">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* No Schools State */}
        {!isLoading && !error && schools.length === 0 && (
          <div className="bg-white shadow rounded-lg p-10 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No schools found
            </h3>
            <p className="text-gray-500 mb-6">
              There are no schools in the database yet.
            </p>
            <Link
              href="/addSchool"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Your First School
            </Link>
          </div>
        )}

        {/* No Results State */}
        {!isLoading &&
          !error &&
          schools.length > 0 &&
          filteredSchools.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No schools match your filters
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Reset All Filters
              </button>
            </div>
          )}

        {/* Schools Grid */}
        {!isLoading && !error && filteredSchools.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* School Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={school.image}
                    alt={school.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback image if the school image fails to load
                      e.target.src = "/schoolImages/default-school.jpg";
                    }}
                  />
                </div>

                {/* School Details */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {school.name}
                  </h3>

                  <div className="mt-4 space-y-2">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Address:</span>{" "}
                      {school.address}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Location:</span>{" "}
                      {school.city}, {school.state}
                    </p>
                  </div>

                  {/* Contact Details - Optional */}
                  {/* <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Contact: {school.contact}
                    </div>
                    <a
                      href={`mailto:${school.email_id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Email
                    </a>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
