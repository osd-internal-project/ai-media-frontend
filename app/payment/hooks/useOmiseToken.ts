"use client";

export interface CardData {
  name: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export function useOmiseToken() {
  const tokenize = (cardData: CardData): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.Omise) {
        reject(new Error("Omise.js is not loaded yet. Please refresh and try again."));
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;
      if (!publicKey) {
        reject(new Error("Omise public key is not configured."));
        return;
      }

      window.Omise.setPublicKey(publicKey);
      window.Omise.createToken(
        "card",
        {
          name: cardData.name.trim(),
          number: cardData.number.replace(/\s/g, ""),
          expiration_month: parseInt(cardData.expiryMonth, 10),
          expiration_year: parseInt(`20${cardData.expiryYear}`, 10),
          security_code: cardData.cvv,
        },
        (statusCode, response) => {
          if (response.object === "error" || !response.id) {
            reject(new Error(response.message ?? "Card tokenization failed"));
          } else {
            resolve(response.id);
          }
        },
      );
    });
  };

  return { tokenize };
}
