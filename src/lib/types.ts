export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  weight: string;
  image: string;
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
