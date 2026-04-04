const BASE_URL = "https://api.thedogapi.com/v1";

// Fallback for debugging - replace with your key if .env isn't working yet
const API_KEY = process.env.EXPO_PUBLIC_DOG_API_KEY || "live_p8MIOKNbReSBf4xRhaZJ0JwCwQfexmedRj5K18D2Q5CaRFp4xB5wmPRjHwv7qCV7";

export const fetchAllBreeds = async () => {
  try {
    console.log("Fetching with key:", API_KEY ? "Key Present" : "Key Missing");
    
    const response = await fetch(`${BASE_URL}/breeds`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Status:", response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Network or Auth Error:", error);
    return [];
  }
};