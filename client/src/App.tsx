import { AnimatePresence } from "framer-motion";
import { Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoute } from "@/components/animated-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
import Calendar from "@/pages/calendar";

function App() {
  const [location] = useLocation();

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Switch key={location} location={location}>
          <AnimatedRoute path="/" component={Home} animation="fade" />
          <AnimatedRoute path="/chat/:agentId" component={Chat} animation="slideHorizontal" />
          <AnimatedRoute path="/payment" component={Payment} animation="slideUp" />
          <AnimatedRoute path="/calendar" component={Calendar} animation="zoom" />
          <AnimatedRoute component={NotFound} animation="fade" />
        </Switch>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

export default App;
