import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export const dashboardController = {
  // Get dashboard overview data
  getOverview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get subscription info
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      // Get counts of different entities
      const [leads, appointments, calls, knowledgeDocuments, customAgents] = await Promise.all([
        storage.getLeadsByUserId(userId),
        storage.getEnhancedAppointmentsByUserId(userId),
        storage.getCallsByUserId(userId, 10), // Get only last 10 calls
        storage.getKnowledgeDocumentsByUserId(userId),
        storage.getCustomAgentsByUserId(userId)
      ]);

      // Get active agents count
      const activeAgentsCount = customAgents.filter(agent => agent.isActive).length;
      
      // Get total calls duration
      const totalCallDuration = calls.reduce((total, call) => total + (call.duration || 0), 0);
      
      // Get upcoming appointments
      const now = new Date();
      const upcomingAppointments = appointments
        .filter(appointment => new Date(appointment.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5); // Get only next 5 appointments
      
      // Get agents data for the dashboard
      const agents = await storage.listAgents();
      
      // Get recent activity for calls and appointments
      const recentActivity = [
        ...calls.map(call => ({
          type: 'call',
          id: call.id,
          timestamp: call.startTime || call.createdAt,
          data: call
        })),
        ...appointments.map(appointment => ({
          type: 'appointment',
          id: appointment.id,
          timestamp: appointment.createdAt,
          data: appointment
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 10); // Get only 10 most recent activities
      
      return res.json({
        subscription,
        counts: {
          leads: leads.length,
          appointments: appointments.length,
          calls: calls.length,
          knowledgeDocuments: knowledgeDocuments.length,
          customAgents: customAgents.length,
          activeAgents: activeAgentsCount
        },
        totalCallDuration,
        upcomingAppointments,
        agents,
        recentActivity
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get leads data
  getLeads: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get all leads for the user
      const leads = await storage.getLeadsByUserId(userId);
      
      // Get counts by status
      const statusCounts = leads.reduce((counts: Record<string, number>, lead) => {
        const status = lead.status || 'new';
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {});
      
      return res.json({
        leads,
        statusCounts
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create a new lead
  createLead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { name, email, phone, company, status, source, notes } = req.body;
      
      const lead = await storage.createLead({
        userId,
        name,
        email,
        phone,
        company,
        status,
        source,
        notes,
        lastContactDate: new Date()
      });
      
      return res.status(201).json({
        message: 'Lead created successfully',
        lead
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update a lead
  updateLead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const leadId = parseInt(req.params.id);
      const { name, email, phone, company, status, source, notes, lastContactDate } = req.body;
      
      // Verify lead belongs to user
      const leads = await storage.getLeadsByUserId(userId);
      const leadExists = leads.some(lead => lead.id === leadId);
      
      if (!leadExists) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      const updatedLead = await storage.updateLead(leadId, {
        name,
        email,
        phone,
        company,
        status,
        source,
        notes,
        lastContactDate: lastContactDate ? new Date(lastContactDate) : undefined
      });
      
      return res.json({
        message: 'Lead updated successfully',
        lead: updatedLead
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get call center data
  getCallCenter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get all calls
      const calls = await storage.getCallsByUserId(userId);
      
      // Get agents
      const agents = await storage.listAgents();
      
      // Calculate call statistics
      const totalCalls = calls.length;
      const totalDuration = calls.reduce((total, call) => total + (call.duration || 0), 0);
      const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
      
      // Get calls by status
      const statusCounts = calls.reduce((counts: Record<string, number>, call) => {
        const status = call.status || 'unknown';
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {});
      
      // Get calls by agent
      const callsByAgent = calls.reduce((byAgent: Record<number, number>, call) => {
        if (call.agentId) {
          byAgent[call.agentId] = (byAgent[call.agentId] || 0) + 1;
        }
        return byAgent;
      }, {});
      
      // Get recent calls
      const recentCalls = [...calls]
        .sort((a, b) => new Date(b.startTime || b.createdAt).getTime() - new Date(a.startTime || a.createdAt).getTime())
        .slice(0, 10);
      
      return res.json({
        calls,
        agents,
        stats: {
          totalCalls,
          totalDuration,
          avgDuration,
          statusCounts,
          callsByAgent
        },
        recentCalls
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Record a call
  recordCall: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { agentId, leadId, duration, status, notes, recordingUrl, startTime, endTime } = req.body;
      
      const call = await storage.createCall({
        userId,
        agentId,
        leadId,
        duration,
        status,
        notes,
        recordingUrl,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      });
      
      // If lead is provided, update last contact date
      if (leadId) {
        await storage.updateLead(leadId, {
          lastContactDate: new Date()
        });
      }
      
      return res.status(201).json({
        message: 'Call recorded successfully',
        call
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get knowledge base data
  getKnowledgeBase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get all knowledge documents
      const documents = await storage.getKnowledgeDocumentsByUserId(userId);
      
      // Get documents by type
      const documentsByType = documents.reduce((byType: Record<string, number>, doc) => {
        const type = doc.documentType || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
        return byType;
      }, {});
      
      // Get documents by status
      const documentsByStatus = documents.reduce((byStatus: Record<string, number>, doc) => {
        const status = doc.status || 'unknown';
        byStatus[status] = (byStatus[status] || 0) + 1;
        return byStatus;
      }, {});
      
      return res.json({
        documents,
        stats: {
          total: documents.length,
          byType: documentsByType,
          byStatus: documentsByStatus
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Upload a knowledge document
  uploadDocument: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { title, content, documentType, sourceUrl } = req.body;
      
      const document = await storage.createKnowledgeDocument({
        userId,
        title,
        content,
        documentType,
        sourceUrl,
        status: 'processing'
      });
      
      // In a real implementation, we would process the document here
      // For example, extract text from PDF, analyze content, etc.
      // Then update the status to 'active' when done
      
      // For now, simulate processing by updating after a delay
      setTimeout(async () => {
        await storage.updateKnowledgeDocumentStatus(document.id, 'active');
      }, 2000);
      
      return res.status(201).json({
        message: 'Document uploaded and processing',
        document
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get appointments data
  getAppointments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get all appointments
      const appointments = await storage.getEnhancedAppointmentsByUserId(userId);
      
      // Get upcoming appointments
      const now = new Date();
      const upcoming = appointments
        .filter(appointment => new Date(appointment.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      // Get past appointments
      const past = appointments
        .filter(appointment => new Date(appointment.startTime) <= now)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      // Get appointments by status
      const byStatus = appointments.reduce((counts: Record<string, number>, appointment) => {
        const status = appointment.status || 'scheduled';
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {});
      
      return res.json({
        appointments,
        upcoming,
        past,
        stats: {
          total: appointments.length,
          upcoming: upcoming.length,
          past: past.length,
          byStatus
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create an appointment
  createAppointment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { 
        attendeeId,
        title, 
        description, 
        startTime, 
        endTime, 
        location, 
        status,
        calendarEventId
      } = req.body;
      
      const appointment = await storage.createEnhancedAppointment({
        userId,
        attendeeId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        status: status || 'scheduled',
        calendarEventId
      });
      
      return res.status(201).json({
        message: 'Appointment created successfully',
        appointment
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update an appointment
  updateAppointment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const appointmentId = parseInt(req.params.id);
      const { 
        attendeeId,
        title, 
        description, 
        startTime, 
        endTime, 
        location, 
        status,
        calendarEventId
      } = req.body;
      
      // Verify appointment belongs to user
      const appointments = await storage.getEnhancedAppointmentsByUserId(userId);
      const appointmentExists = appointments.some(appt => appt.id === appointmentId);
      
      if (!appointmentExists) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      const updatedAppointment = await storage.updateEnhancedAppointment(appointmentId, {
        attendeeId,
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        location,
        status,
        calendarEventId
      });
      
      return res.json({
        message: 'Appointment updated successfully',
        appointment: updatedAppointment
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get AI agents data
  getAIAgents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get all custom agents
      const customAgents = await storage.getCustomAgentsByUserId(userId);
      
      // Get predefined agents
      const predefinedAgents = await storage.listAgents();
      
      // Get active vs inactive agents
      const activeAgents = customAgents.filter(agent => agent.isActive).length;
      const inactiveAgents = customAgents.length - activeAgents;
      
      return res.json({
        customAgents,
        predefinedAgents,
        stats: {
          total: customAgents.length,
          active: activeAgents,
          inactive: inactiveAgents
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create a custom AI agent
  createCustomAgent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { 
        name, 
        description, 
        avatar, 
        prompt, 
        knowledgeDocumentIds,
        isActive
      } = req.body;
      
      const agent = await storage.createCustomAgent({
        userId,
        name,
        description,
        avatar,
        prompt,
        knowledgeDocumentIds,
        isActive: isActive !== false // Default to active
      });
      
      return res.status(201).json({
        message: 'Custom agent created successfully',
        agent
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update a custom AI agent
  updateCustomAgent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const agentId = parseInt(req.params.id);
      const { 
        name, 
        description, 
        avatar, 
        prompt, 
        knowledgeDocumentIds,
        isActive
      } = req.body;
      
      // Verify agent belongs to user
      const agents = await storage.getCustomAgentsByUserId(userId);
      const agentExists = agents.some(agent => agent.id === agentId);
      
      if (!agentExists) {
        return res.status(404).json({ message: 'Custom agent not found' });
      }
      
      const updatedAgent = await storage.updateCustomAgent(agentId, {
        name,
        description,
        avatar,
        prompt,
        knowledgeDocumentIds,
        isActive
      });
      
      return res.json({
        message: 'Custom agent updated successfully',
        agent: updatedAgent
      });
    } catch (error) {
      next(error);
    }
  }
};