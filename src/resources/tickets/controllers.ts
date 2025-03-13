import { Router, Request, Response } from "express";
import { validatePassengers, type IPassenger } from "./dtos";

import { TicketService } from "./service";


export class TicketsController {
  private router: Router;

  constructor(
    private ticketService: TicketService = new TicketService()) {

    this.router = Router();
    this.initializeRoutes();
  }

  private bookTickets = async (req: Request, res: Response) => {
    try {
      const { passengers, trainUniqueId, phone }: { passengers: IPassenger[]; trainUniqueId: string, phone: string } = req.body;

      // Basic validation for required fields
      if (!trainUniqueId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
        res.status(400).json({ message: "Missing or invalid trainUniqueId or passengers list." }); return;
      }

      // Validate passengers
      const { validPassengers, errors } = validatePassengers(passengers);

      if (errors.length > 0) {
        res.status(400).json({ message: "Passenger validation failed.", errors });
        return;
      }

      const bookedTickets = await this.ticketService.bookTicket(validPassengers, trainUniqueId, phone);

      res.status(200).json({ message: "Tickets booked successfully", data: bookedTickets });



    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }

  private getTickets = async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      console.log(`ticket`, ticketId);
      const ticketDetails = await this.ticketService.getTicketDetails(ticketId);
      res.status(200).json({ message: "Ticket details fetched successfully", data: ticketDetails });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }
  private cancelTicket = async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      console.log(`ticket`, ticketId);
      const ticketDetails = await this.ticketService.cancelTicket(ticketId);
      res.status(200).json({ message: "Ticket details fetched successfully", data: ticketDetails });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }



  private initializeRoutes(): void {
    this.router.post("/tickets/book", this.bookTickets);
    this.router.get("/tickets/ticket/:ticketId", this.getTickets);
    this.router.delete("/tickets/ticket/:ticketId", this.cancelTicket);
  }

  public getRouter(): Router {
    return this.router;
  }
}
