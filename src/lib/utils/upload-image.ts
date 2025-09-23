export interface ImageUploadResult {
  url: string;
  pathname: string;
}

export async function uploadImage(file: File): Promise<ImageUploadResult> {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Send the file to our API route
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Upload failed with status ${response.status}`,
      );
    }

    // Get the response data
    const blob = await response.json();

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload image",
    );
  }
}
