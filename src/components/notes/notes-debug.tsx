"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { noteAPI } from "@/lib/api/note";
import { useState } from "react";

export function NotesDebug() {
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get auth context
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const testAPI = async () => {
    setLoading(true);
    setStatus("Testing...");
    setError(null);
    setResult(null);

    try {
      // Test 1: Check if access token exists
      const accessToken = localStorage.getItem("accessToken");
      console.log("🔑 Access Token:", accessToken ? "Found" : "Not found");

      if (!accessToken) {
        throw new Error(
          "No access token found in localStorage. Please login first.",
        );
      }

      // Test 2: Test the API endpoint
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      console.log("🌍 API Base URL:", API_BASE_URL);

      // Test 3: Make actual API call
      console.log("🚀 Making API call...");
      const response = await noteAPI.getNotes({ page: 0, size: 5 });
      console.log("✅ API Response:", response);

      setResult(response);
      setStatus("Success!");
    } catch (err: any) {
      console.error("❌ API Test Error:", err);
      setError(err.message || "Unknown error");
      setStatus("Failed");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setStatus("Testing connection...");
    setError(null);
    setResult(null);

    try {
      console.log("🔗 Testing connection...");
      const isConnected = await noteAPI.testConnection();
      console.log("🔗 Connection result:", isConnected);
      setResult({ connected: isConnected });
      setStatus(isConnected ? "Connected!" : "Connection failed");
    } catch (err: any) {
      console.error("❌ Connection test error:", err);
      setError(err.message);
      setStatus("Connection test failed");
    } finally {
      setLoading(false);
    }
  };

  const testAuthHeaders = () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No access token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      setResult({
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        headers: Object.keys(headers),
      });
      setStatus("Auth headers checked");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearData = () => {
    setStatus("Ready");
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Notes API Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={loading}>
              Test Connection
            </Button>
            <Button onClick={testAuthHeaders} disabled={loading}>
              Check Auth
            </Button>
            <Button onClick={testAPI} disabled={loading}>
              Test Get Notes
            </Button>
            <Button onClick={clearData} variant="outline">
              Clear
            </Button>
          </div>

          <div>
            <strong>Status:</strong> {status}
            {loading && <span className="ml-2 animate-pulse">...</span>}
          </div>

          <div>
            <strong>Auth Context:</strong>
            <pre className="mt-2 rounded bg-muted p-2 text-sm">
              {JSON.stringify(
                {
                  isAuthenticated,
                  authLoading,
                  hasUser: !!user,
                  hasAccessToken: !!accessToken,
                  userName: user?.username,
                  userEmail: user?.email,
                },
                null,
                2,
              )}
            </pre>
          </div>

          <div>
            <strong>Environment Variables:</strong>
            <pre className="mt-2 rounded bg-muted p-2 text-sm">
              NEXT_PUBLIC_API_URL:{" "}
              {process.env.NEXT_PUBLIC_API_URL || "undefined"}
            </pre>
          </div>

          <div>
            <strong>LocalStorage Token:</strong>
            <pre className="mt-2 rounded bg-muted p-2 text-sm">
              {typeof window !== "undefined"
                ? localStorage.getItem("accessToken")
                  ? `Token exists (${
                      localStorage.getItem("accessToken")?.length
                    } chars)`
                  : "No token found"
                : "Server side - cannot access localStorage"}
            </pre>
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <strong className="text-destructive">Error:</strong>
                <pre className="mt-2 whitespace-pre-wrap text-destructive text-sm">
                  {error}
                </pre>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardContent className="p-4">
                <strong>Result:</strong>
                <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-2 text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
