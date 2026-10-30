export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  /** Original price before an offer. 0 when there is no offer. */
  mrp: number;
  weight: string;
  image: string;
  /** Every photo for the gallery (the sheet image column may list several, separated by |). */
  images: string[];
  shortDescription: string;
  ingredients: string;
  calories: string;
  protein: string;
  carbs: string;
  fibre: string;
  fat: string;
  fssai: string;
  inStock: boolean;
  videoId: string;
  tags: string[];
  howToUse: string;
}

export interface CartLine {
  p: Product;
  qty: number;
}

export interface CheckoutData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}
