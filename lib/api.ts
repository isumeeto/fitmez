import { Item, RecommendResponse } from "./types";
import { MOCK_WARDROBE_ITEMS } from "./mock/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://dripcheck-api.onrender.com";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// Local in-memory / localStorage storage for mock mode wardrobe
const WARDROBE_STORAGE_KEY = "dripcheck_mock_wardrobe";

function getStoredMockItems(): Item[] {
  if (typeof window === "undefined") {
    return MOCK_WARDROBE_ITEMS;
  }
  try {
    const raw = localStorage.getItem(WARDROBE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(MOCK_WARDROBE_ITEMS));
      return MOCK_WARDROBE_ITEMS;
    }
    return JSON.parse(raw) as Item[];
  } catch {
    return MOCK_WARDROBE_ITEMS;
  }
}

function saveStoredMockItems(items: Item[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to persist mock wardrobe items:", err);
  }
}

export async function uploadItem(userId: string, file: File): Promise<Item> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 1400)); // Simulate vision model processing

    const tempUrl = URL.createObjectURL(file);
    const mockTypes = ["shirt", "pants", "shoes", "jacket", "accessory"] as const;
    const mockColors = ["white", "black", "navy", "cream", "charcoal", "olive", "beige"];
    const mockStyles = ["casual", "minimal", "streetwear", "formal"];
    const mockFits = ["oversized", "regular", "slim"];
    const mockSeasons = ["summer", "winter", "all-season"];
    const mockOccasions = ["casual", "office", "date", "party"];

    const detectedType = mockTypes[Math.floor(Math.random() * mockTypes.length)];
    const detectedColor = mockColors[Math.floor(Math.random() * mockColors.length)];

    const newItem: Item = {
      id: "item-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      image_url: tempUrl,
      type: detectedType,
      color: detectedColor,
      pattern: "solid",
      fit: mockFits[Math.floor(Math.random() * mockFits.length)],
      style: mockStyles[Math.floor(Math.random() * mockStyles.length)],
      season: mockSeasons[Math.floor(Math.random() * mockSeasons.length)],
      occasion: mockOccasions[Math.floor(Math.random() * mockOccasions.length)],
    };

    const current = getStoredMockItems();
    saveStoredMockItems([newItem, ...current]);
    return newItem;
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to upload item: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function getItems(userId: string): Promise<Item[]> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return getStoredMockItems();
  }

  const res = await fetch(`${API_BASE_URL}/items?user_id=${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch items: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function deleteItem(id: string): Promise<{ success: boolean }> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = getStoredMockItems();
    const updated = current.filter((item) => item.id !== id);
    saveStoredMockItems(updated);
    return { success: true };
  }

  const res = await fetch(`${API_BASE_URL}/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete item: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function recommendOutfit(userId: string, occasion: string): Promise<RecommendResponse> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate Groq reasoning latency

    const items = getStoredMockItems();
    const shirts = items.filter((i) => i.type === "shirt");
    const pants = items.filter((i) => i.type === "pants");
    const shoes = items.filter((i) => i.type === "shoes");
    const jackets = items.filter((i) => i.type === "jacket");

    const selectedShirt = shirts[0] || items[0] || { id: "item-1", type: "shirt", color: "white" };
    const selectedPants = pants[0] || items[1] || { id: "item-2", type: "pants", color: "cream" };
    const selectedShoes = shoes[0] || items[2] || { id: "item-3", type: "shoes", color: "white" };
    const selectedJacket = jackets.length > 0 && (occasion === "office" || occasion === "date" || Math.random() > 0.5) ? jackets[0] : null;

    const chosenItems: Pick<Item, "id" | "type" | "color">[] = [
      { id: selectedShirt.id, type: selectedShirt.type, color: selectedShirt.color },
      { id: selectedPants.id, type: selectedPants.type, color: selectedPants.color },
      { id: selectedShoes.id, type: selectedShoes.type, color: selectedShoes.color },
    ];

    if (selectedJacket) {
      chosenItems.push({ id: selectedJacket.id, type: selectedJacket.type, color: selectedJacket.color });
    }

    const occasionExplanations: Record<string, string> = {
      casual: `The ${selectedShirt.color} ${selectedShirt.type} paired with relaxed ${selectedPants.color} ${selectedPants.type} and clean ${selectedShoes.color} ${selectedShoes.type} balances high-comfort with intentional proportion. It feels effortless and grounded for an easy day out.`,
      office: `For the workplace, the crisp contrast between the ${selectedShirt.color} top and structured ${selectedPants.color} trousers delivers a sharp, clean aesthetic. Rounded out with understated ${selectedShoes.color} footwear, it conveys quiet confidence and authority.`,
      date: `A sophisticated evening silhouette. The gentle drape of the ${selectedShirt.color} top balances the tone of the ${selectedPants.color} bottom, while the ${selectedShoes.color} shoes ground the ensemble with elevated subtlety.`,
      party: `High-impact minimalist contrast. The combination of the ${selectedShirt.color} piece with clean ${selectedPants.color} lines allows your personal silhouette to stand out without looking over-engineered.`,
    };

    const explanation = occasionExplanations[occasion] || `A cohesive color palette pairing ${selectedShirt.color} and ${selectedPants.color} with ${selectedShoes.color} footwear for a balanced, modern fit.`;

    const outfitId = "outfit-" + Date.now().toString(36);
    // Cache the recommendation so result page can retrieve it if accessed directly
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`dripcheck_rec_${outfitId}`, JSON.stringify({ outfit_id: outfitId, items: chosenItems, explanation }));
      } catch (e) {
        console.error(e);
      }
    }

    return {
      outfit_id: outfitId,
      items: chosenItems,
      explanation,
    };
  }

  const res = await fetch(`${API_BASE_URL}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ user_id: userId, occasion }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to generate recommendation: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function sendFeedback(userId: string, outfitId: string, rating: number): Promise<{ success: boolean }> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  }

  const res = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ user_id: userId, outfit_id: outfitId, rating }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send feedback: ${res.status} ${errorText}`);
  }

  return res.json();
}
