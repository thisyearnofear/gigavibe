import { useContext } from "react";
import { FilCDNContext } from "@/providers/FilCDNProvider";

export function useFilCDN() {
  const context = useContext(FilCDNContext);
  if (context === undefined) {
    throw new Error("useFilCDN must be used within a FilCDNProvider");
  }
  return context;
}