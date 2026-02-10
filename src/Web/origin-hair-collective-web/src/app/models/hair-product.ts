export interface HairProduct {
  id: string;
  name: string;
  originId: string;
  originCountry: string;
  texture: string;
  type: string;
  lengthInches: number;
  price: number;
  description: string;
  imageUrl: string | null;
}
