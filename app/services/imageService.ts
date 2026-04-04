const UPLOAD_URL = "https://upload.thedogapi.com/v1";
const API_KEY = process.env.EXPO_PUBLIC_DOG_API_KEY || "live_p8MIOKNbReSBf4xRhaZJ0JwCwQfexmedRj5K18D2Q5CaRFp4xB5wmPRjHwv7qCV7";

/**
 * Uploads an image to the Dog API to analyze and identify breeds.
 * Supports multiple file types dynamically.
 */
export const identifyDogFromImage = async (fileUri: string) => {
  try {
    const formData = new FormData();

    // Check if we are on Web
    const isWeb = typeof window !== 'undefined' && !!window.document;

    if (isWeb) {
      // 1. Convert URI to Blob for Web
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      // Get extension for name
      const extension = blob.type.split('/')[1] || 'jpg';
      formData.append("file", blob, `upload.${extension}`);
    } else {
      // 2. Standard Mobile logic
      const uriParts = fileUri.split('.');
      const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
      const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      formData.append("file", {
        uri: fileUri,
        name: `upload.${fileExtension}`,
        type: mimeType,
      } as any);
    }

    const response = await fetch(`${UPLOAD_URL}/images/upload-sync`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Upload Identification Error:", response.status, errorData);
      throw new Error(`Upload Sync failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Network or Identification Error:", error);
    return null;
  }
};