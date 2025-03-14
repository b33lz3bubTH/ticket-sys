import { Router, Request, Response } from "express";
import { validatePassengers, type IPassenger } from "./dtos";

import { TicketService } from "./service";
import { ticketValidation } from "./validators";


export class TicketsController {
  private router: Router;

  constructor(
    private ticketService: TicketService = new TicketService()) {

    this.router = Router();
    this.initializeRoutes();
  }


  private bookTickets = async (req: Request, res: Response) => {
    try {
      const { passengers, trainUniqueId, phone }: { passengers: IPassenger[]; trainUniqueId: string; phone: string } = req.body;

      // Basic validation for required fields
      if (!trainUniqueId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
        res.status(400).json({ message: "Missing or invalid trainUniqueId or passengers list." });
        return;
      }

      // Validate passengers
      const { validPassengers, errors: validationErrors } = validatePassengers(passengers);

      if (validationErrors.length > 0) {
        res.status(400).json({ message: "passenger validation failed.", errors: validationErrors });
        return;
      }

      // Attempt to book tickets
      const { bookedTickets, failedPassengers } = await this.ticketService.bookTicket(validPassengers, trainUniqueId, phone);

      if (bookedTickets.length === 0) {
        res.status(400).json({
          message: "No tickets could be booked.",
          errors: failedPassengers
        });
        return;
      }

      res.status(200).json({
        message: "Some tickets booked successfully.",
        bookedTickets,
        failedPassengers: failedPassengers.length > 0 ? failedPassengers : undefined
      });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  private getTickets = async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const ticketDetails = await this.ticketService.getTicketDetails(ticketId);
      res.status(200).json({ message: "ticket details fetched successfully", data: ticketDetails });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }
  private cancelTicket = async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const ticketDetails = await this.ticketService.cancelTicket(ticketId);
      res.status(200).json({ message: "ticket deleted successfully" });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }



  private initializeRoutes(): void {
    this.router.post("/tickets/book", ticketValidation, this.bookTickets);
    this.router.get("/tickets/ticket/:ticketId", this.getTickets);
    this.router.delete("/tickets/ticket/:ticketId", this.cancelTicket);
  }

  public getRouter(): Router {
    return this.router;
  }
}
