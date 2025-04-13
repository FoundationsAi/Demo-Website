import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, ArrowLeft, Calendar as CalendarComponent, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

export const Calendar: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Generate time slots for the selected date
  useEffect(() => {
    if (date) {
      // This would normally come from the API based on the selected date
      const slots: TimeSlot[] = [];
      
      // Generate time slots from 9 AM to 5 PM
      for (let hour = 9; hour <= 17; hour++) {
        const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
        const period = hour < 12 ? "AM" : "PM";
        
        slots.push({
          id: `${hour}:00`,
          time: `${hourFormatted}:00 ${period}`,
          available: Math.random() > 0.3 // Randomly make some slots unavailable
        });
        
        if (hour < 17) { // Don't add the :30 slot for 5 PM
          slots.push({
            id: `${hour}:30`,
            time: `${hourFormatted}:30 ${period}`,
            available: Math.random() > 0.3
          });
        }
      }
      
      setTimeSlots(slots);
      setSelectedTimeSlot(null); // Reset selected time when date changes
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedTimeSlot || !name || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields to schedule your appointment.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/schedule-appointment", {
        date: format(date, "yyyy-MM-dd"),
        timeSlot: selectedTimeSlot,
        name,
        email,
        phone,
        notes
      });
      
      setIsSuccess(true);
      
      toast({
        title: "Appointment Scheduled",
        description: "Your appointment has been successfully scheduled!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem scheduling your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Demo Call</CardTitle>
              <CardDescription>
                Book a time to speak with one of our AI agents and experience the future of voice AI
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Appointment Confirmed!</h3>
                  <p className="text-white/70 mb-6">
                    Your demo call has been scheduled for{" "}
                    <span className="font-medium text-white">
                      {date && format(date, "MMMM d, yyyy")} at {selectedTimeSlot && timeSlots.find(slot => slot.id === selectedTimeSlot)?.time}
                    </span>
                  </p>
                  
                  <div className="bg-[#1E1E1E]/50 border border-white/10 rounded-lg p-4 max-w-sm mx-auto mb-6">
                    <div className="mb-2">
                      <p className="text-sm text-white/60">Name:</p>
                      <p>{name}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-white/60">Email:</p>
                      <p>{email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Phone:</p>
                      <p>{phone}</p>
                    </div>
                  </div>
                  
                  <Button onClick={() => setLocation("/")} className="gradient-button">
                    Return to Home
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select Date & Time</h3>
                      
                      <div className="space-y-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-white/60"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarUI
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) => 
                                date < new Date() || 
                                date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        
                        {date && (
                          <div>
                            <Label className="mb-2 block">Available Time Slots</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {timeSlots.map((slot) => (
                                <Button
                                  key={slot.id}
                                  type="button"
                                  variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                                  className={`justify-start ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                                  onClick={() => {
                                    if (slot.available) {
                                      setSelectedTimeSlot(slot.id);
                                    }
                                  }}
                                  disabled={!slot.available}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {slot.time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Your Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-[#2D2D2D] border-white/10"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-[#2D2D2D] border-white/10"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="bg-[#2D2D2D] border-white/10"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tell us what you'd like to discuss"
                            className="bg-[#2D2D2D] border-white/10"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="gradient-button w-full"
                    disabled={isLoading || !date || !selectedTimeSlot}
                  >
                    {isLoading ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="text-sm text-white/60 justify-center">
              You'll receive a confirmation via email and SMS once your appointment is scheduled.
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Calendar;
