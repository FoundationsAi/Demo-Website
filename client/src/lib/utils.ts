import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to scroll to a section with smooth behavior
export function scrollToSection(id: string, offset: number = -100) {
  const element = document.getElementById(id);
  if (element) {
    const position = element.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({
      top: position,
      behavior: "smooth",
    });
  }
}

// Features data
export const features = [
  {
    id: "voice-ai",
    title: "Voice AI API",
    description: "Natural, smooth, and empathetic AI conversations with only 500ms latency.",
    icon: "microphone",
    badge: "Powered by 11 Labs API"
  },
  {
    id: "agents",
    title: "Diverse Agent Selection",
    description: "Choose from multiple AI agents with distinct personalities tailored to your business needs.",
    icon: "users",
    badge: "Customizable personalities"
  },
  {
    id: "sms",
    title: "SMS Notifications",
    description: "Send automated notifications for appointments, follow-ups, and important updates.",
    icon: "message-square",
    badge: "Integrated with Twilio"
  },
  {
    id: "calendar",
    title: "Calendar Booking",
    description: "Let your AI agents schedule appointments and sync directly with Google Calendar.",
    icon: "calendar",
    badge: "Google Calendar API"
  },
  {
    id: "payments",
    title: "Secure Payments",
    description: "Process payments safely and securely through your voice agents with Stripe integration.",
    icon: "credit-card",
    badge: "Stripe integration"
  },
  {
    id: "transfer",
    title: "Seamless Call Transfer",
    description: "Warm transfer calls from AI to human representatives with complete context handoff.",
    icon: "external-link",
    badge: "Full conversation history"
  }
];

// Agent types
export const agents = [
  {
    id: "customer-service",
    name: "AI Customer Service",
    description: "Friendly and efficient agent that handles customer inquiries with empathy and precision.",
    badge: "24/7 Availability",
    tags: ["Customer Support", "Troubleshooting", "Information"]
  },
  {
    id: "sales",
    name: "AI Sales Qualification",
    description: "Professional agent that qualifies leads, books meetings, and nurtures potential customers.",
    badge: "Lead Generation",
    tags: ["Lead Qualification", "Meeting Booking", "Follow-up"]
  },
  {
    id: "receptionist",
    name: "AI Receptionist",
    description: "Professional virtual receptionist that greets callers, directs inquiries, and schedules appointments.",
    badge: "Call Handling",
    tags: ["Call Routing", "Appointment Setting", "FAQs"]
  },
  {
    id: "mortgage",
    name: "AI Mortgage Specialist",
    description: "Knowledgeable agent specializing in mortgage information, pre-qualification, and application processes.",
    badge: "Financial Services",
    tags: ["Pre-qualification", "Rate Information", "Application"]
  },
  {
    id: "healthcare",
    name: "AI Healthcare Scheduler",
    description: "Compassionate agent that schedules medical appointments, sends reminders, and answers basic health questions.",
    badge: "HIPAA Compliant",
    tags: ["Appointment Booking", "Reminders", "Basic Information"]
  },
  {
    id: "concierge",
    name: "AI Concierge",
    description: "Sophisticated concierge agent that assists with bookings, recommendations, and special requests.",
    badge: "Hospitality",
    tags: ["Reservations", "Recommendations", "Special Requests"]
  }
];

// Use cases
export const useCases = [
  {
    id: "lead-qualification",
    title: "Lead Qualification",
    icon: "clipboard"
  },
  {
    id: "appointment",
    title: "Appointment Setter",
    icon: "calendar"
  },
  {
    id: "survey",
    title: "Survey",
    icon: "mail"
  },
  {
    id: "debt",
    title: "Debt Collection",
    icon: "dollar-sign"
  },
  {
    id: "customer-service",
    title: "Customer Service",
    icon: "life-buoy"
  },
  {
    id: "receptionist",
    title: "Receptionist",
    icon: "phone"
  }
];

// Integration partners
export const integrations = [
  { name: "Vonage", logo: "vonage" },
  { name: "OpenAI", logo: "openai" },
  { name: "Cal.com", logo: "calendar" },
  { name: "n8n", logo: "workflow" },
  { name: "GoHighLevel", logo: "arrow-up-right-circle" },
  { name: "Twilio", logo: "message-square" }
];

// How it works steps
export const howItWorksSteps = [
  {
    step: "01",
    title: "Build",
    description: "Create custom voice AI agents using our intuitive builder interface. Define personalities, knowledge base, and conversation flows."
  },
  {
    step: "02",
    title: "Test",
    description: "Perform comprehensive testing with built-in LLM features to ensure your agents handle edge cases smoothly."
  },
  {
    step: "03",
    title: "Deploy",
    description: "Easily deploy your agents to phone calls, web chats, SMS, and more with just a few clicks."
  },
  {
    step: "04",
    title: "Monitor",
    description: "Track success rates, latency, and user sentiment through our real-time analytics dashboard."
  }
];
