import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

// Create a function for smooth scrolling (without Lenis for now)
const SmoothScrolling = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="smooth-scroll">
      {children}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SmoothScrolling>
      <App />
    </SmoothScrolling>
  </QueryClientProvider>
);
