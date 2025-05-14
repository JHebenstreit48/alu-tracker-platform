import { useState, ReactNode } from "react";
import { LoadingContext } from "@/components/Shared/Loading/LoadingContext";

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
