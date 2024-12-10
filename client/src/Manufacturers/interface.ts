export interface BrandInfo {
  letterKey: string;
  brands: {
    brandsKey: string;
    logo?: string;
    info: string;
    resources?: {
      text: string;
      url: string;
    }[];
  }[];
}
