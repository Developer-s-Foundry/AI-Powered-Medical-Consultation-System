export interface DrugAttributes {
  id?: string;
  pharmacyId: string;
  medicineName: string;
  dosage: string;
  manufacturer: string;
  quantity: number;
  price: number;
  expiryDate: Date;
  description?: string;
  requiresPrescription: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DrugSearchFilters {
  medicineName?: string;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  pharmacyId?: string;
  requiresPrescription?: boolean;
}
