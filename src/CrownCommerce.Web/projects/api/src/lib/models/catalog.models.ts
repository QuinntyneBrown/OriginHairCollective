export interface HairOrigin {
  id: string;
  country: string;
  region: string;
  description: string;
}

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

export interface CreateOriginRequest {
  country: string;
  region: string;
  description: string;
}

export interface UpdateOriginRequest {
  country: string;
  region: string;
  description: string;
}

export interface CreateProductRequest {
  name: string;
  originId: string;
  texture: string;
  type: string;
  lengthInches: number;
  price: number;
  description: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name: string;
  originId: string;
  texture: string;
  type: string;
  lengthInches: number;
  price: number;
  description: string;
  imageUrl?: string;
}
