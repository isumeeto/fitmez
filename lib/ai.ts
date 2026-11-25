import { MatchResult, FitScore, Pin, Item } from "./types";
import { MOCK_WARDROBE_ITEMS } from "./mock/data";

// TODO(backend): Replace with POST /ai/recreate-look
export async function recreateLook(postId: string): Promise<MatchResult> {
  // Matches wardrobe pieces against the look
  const matched = [
    { itemId: MOCK_WARDROBE_ITEMS[0]?.id || "item-1", matchPct: 94 },
    { itemId: MOCK_WARDROBE_ITEMS[1]?.id || "item-2", matchPct: 88 },
    { itemId: MOCK_WARDROBE_ITEMS[2]?.id || "item-3", matchPct: 91 },
  ];

  const missing = [
    "Unstructured Navy Wool Trench",
    "Silver Minimalist Signet Ring",
  ];

  return {
    postId,
    matched,
    missing,
  };
}

// TODO(backend): Replace with POST /ai/suggest-captions
export async function suggestCaptions(
  _image: string,
  _pins?: Pin[]
): Promise<{ captions: string[]; suggestedTags: string[] }> {
  return {
    captions: [
      "Layering weight and structure in deep sea navy tones.",
      "Minimalist drape for an overcast afternoon.",
      "Clean lines, textured linen, zero noise.",
    ],
    suggestedTags: ["Minimal", "Smart casual", "Navy", "Drape", "Tailoring"],
  };
}

// TODO(backend): Replace with POST /ai/rate-outfit
export async function rateOutfit(
  _image: string,
  _occasion: string = "casual"
): Promise<FitScore> {
  // Deterministic scores in 6.5 - 9.5 range
  return {
    total: 8.8,
    fit: 9.2,
    color: 8.6,
    occasion: 8.9,
    accessories: 8.4,
    tips: [
      "Try tucking the shirt slightly for a sharper hip break.",
      "The contrast between charcoal and sky blue elevates the palette.",
      "Consider a minimalist silver cuff to ground the accessories score.",
    ],
  };
}

// TODO(backend): Replace with POST /ai/ask-stylist
export interface StylistAIResponse {
  reply: string;
  suggestedItems: Pick<Item, "id" | "type" | "color">[];
  stylingTips: string[];
}

export async function askStylistAI(
  prompt: string,
  wardrobeItems: Item[],
  occasion: string = "casual"
): Promise<StylistAIResponse> {
  // Simulate AI reasoning latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const items = wardrobeItems.length > 0 ? wardrobeItems : MOCK_WARDROBE_ITEMS;
  const lowerPrompt = prompt.toLowerCase();

  // Find relevant wardrobe pieces based on prompt keywords and types
  const pants = items.filter((i) => i.type.toLowerCase().includes("pant") || i.type.toLowerCase().includes("jean") || i.type.toLowerCase().includes("trouser"));
  const shirts = items.filter((i) => i.type.toLowerCase().includes("shirt") || i.type.toLowerCase().includes("top") || i.type.toLowerCase().includes("tee"));
  const jackets = items.filter((i) => i.type.toLowerCase().includes("jacket") || i.type.toLowerCase().includes("coat") || i.type.toLowerCase().includes("outerwear"));
  const shoes = items.filter((i) => i.type.toLowerCase().includes("shoe") || i.type.toLowerCase().includes("boot") || i.type.toLowerCase().includes("sneaker"));

  const matchedPants = pants.find((p) => lowerPrompt.includes(p.color.toLowerCase())) || pants[0] || items[1] || items[0];
  const matchedShirt = shirts.find((s) => lowerPrompt.includes(s.color.toLowerCase())) || shirts[0] || items[0];
  const matchedJacket = jackets.find((j) => lowerPrompt.includes(j.color.toLowerCase())) || jackets[0] || null;
  const matchedShoes = shoes[0] || items[2] || items[0];

  let reply = "";
  const tips: string[] = [];
  const suggested: Pick<Item, "id" | "type" | "color">[] = [];

  if (lowerPrompt.includes("cream") || lowerPrompt.includes("pant")) {
    reply = `To highlight your ${matchedPants?.color || "cream"} ${matchedPants?.type || "pants"}, pair them with your ${matchedShirt?.color || "crisp"} ${matchedShirt?.type || "shirt"} and clean footwear. The tonal contrast establishes a relaxed, architectural silhouette tailored for a ${occasion} atmosphere.`;
    tips.push("Tuck the front hem slightly to define your waistline without looking overly formal.");
    tips.push("Opt for low-profile footwear to keep the ankle break streamlined.");
  } else if (lowerPrompt.includes("color") || lowerPrompt.includes("combo")) {
    reply = `The most cohesive color pairing in your closet right now balances ${matchedShirt?.color || "black"} with ${matchedPants?.color || "olive"}. It pairs quiet earthy neutrality with sharp contrast, generating depth without clashing.`;
    tips.push("Follow the 2:1 ratio: two harmonious neutral tones anchored by one rich grounding hue.");
    tips.push("Match metal tones on your watch and belt buckle to the garment undertones.");
  } else if (lowerPrompt.includes("layer") || lowerPrompt.includes("breezy") || lowerPrompt.includes("evening")) {
    reply = `For breezy conditions, layer your ${matchedShirt?.color || "white"} ${matchedShirt?.type || "top"} under ${matchedJacket ? `your ${matchedJacket.color} ${matchedJacket.type}` : "a lightweight overshirt"}, resting gently above ${matchedPants?.color || "charcoal"} bottoms.`;
    tips.push("Keep outerwear unzipped or open to showcase the vertical inner drape.");
    tips.push("Use differing fabric weights (structured cotton over soft jersey) for textural intrigue.");
  } else if (lowerPrompt.includes("minimal") || lowerPrompt.includes("sharp")) {
    reply = `For a razor-sharp minimal aesthetic, anchor your fit around monochromatic purity: your ${matchedShirt?.color || "neutral"} top, clean ${matchedPants?.color || "tailored"} trousers, and sleek ${matchedShoes?.color || "neutral"} shoes. Pure proportion, zero distraction.`;
    tips.push("Keep silhouettes uninhibited by excessive accessories—let fabric drape lead.");
    tips.push("Check that the trouser cuffs sit right above the footwear vamp with clean breaks.");
  } else {
    reply = `For your ${occasion} plans, I recommend harmonizing your ${matchedShirt?.color || "classic"} ${matchedShirt?.type || "piece"} with your ${matchedPants?.color || "versatile"} ${matchedPants?.type || "bottoms"}. It crafts a deliberate, effortless look reflecting your capsule aesthetic.`;
    tips.push("Balance fit geometry: if the top is relaxed, pair with straight or structured trousers.");
    tips.push("Adapt outer layers to transition seamlessly between indoor and outdoor venues.");
  }

  if (matchedShirt) suggested.push({ id: matchedShirt.id, type: matchedShirt.type, color: matchedShirt.color });
  if (matchedPants) suggested.push({ id: matchedPants.id, type: matchedPants.type, color: matchedPants.color });
  if (matchedJacket) suggested.push({ id: matchedJacket.id, type: matchedJacket.type, color: matchedJacket.color });
  if (matchedShoes) suggested.push({ id: matchedShoes.id, type: matchedShoes.type, color: matchedShoes.color });

  return {
    reply,
    suggestedItems: suggested,
    stylingTips: tips,
  };
}
