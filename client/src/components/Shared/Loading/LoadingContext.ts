import { createContext } from "react";

export interface LoadingContextType {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextType | null>(null);
