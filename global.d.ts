declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css";

// Omise.js global (loaded via CDN script)
interface OmiseCardData {
  name: string;
  number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
}

interface OmiseTokenResponse {
  object: "token" | "error";
  id?: string;
  message?: string;
  code?: string;
}

interface OmiseStatic {
  setPublicKey(key: string): void;
  createToken(
    type: "card",
    data: OmiseCardData,
    callback: (statusCode: number, response: OmiseTokenResponse) => void,
  ): void;
}

interface Window {
  Omise?: OmiseStatic;
}
