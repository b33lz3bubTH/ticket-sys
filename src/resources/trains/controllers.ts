import { Router, Request, Response } from "express";
import { PrismaSingleton } from "../../plugins/datasource/db";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { TicketService } from "../tickets/service";
import { ISeatConfig } from "../../types";

export class TrainsController {
  private router: Router;

  constructor(private prisma: PrismaClient = PrismaSingleton.getInstance(), private ticketService: TicketService = new TicketService()) {
    this.router = Router();
    this.initializeRoutes();
  }

  private getTrainTimings = async (req: Request, res: Response) => {
    try {
      const { trainUniqueId } = req.params;
      const trainTimings = await this.prisma.trainTiming.findFirst({where: {trainUniqueId: trainUniqueId as string}});
      const trainSeatConfig = await this.ticketService.getTrainSeatingConfig(trainUniqueId as string);
      console.log(`trainSeatConfig: `, trainSeatConfig);
      const config = trainSeatConfig;
      res.status(200).json({ message: "Train timings fetched successfully", data: {trainTimings, config} });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }

  private addTrainTimings = async (req: Request, res: Response) => {
    try {
      const { trainNo, source, destination, sourceTime, destinationTime } = req.body as any;

      if (!trainNo || !source || !destination || !sourceTime || !destinationTime) {
        throw new Error("Missing required fields");
      }

      const uniqueTrainId = uuidv4();


      const [newTrainTiming, newSeatingConfig] = await this.prisma.$transaction([
        this.prisma.trainTiming.create({
          data: {
            trainUniqueId: uniqueTrainId,
            trainNo,
            source,
            destination,
            sourceTime,
            destinationTime,
          },
        }),
        this.prisma.trainConfig.create({
          data: {
            trainUniqueId: uniqueTrainId,
            config: JSON.stringify(this.ticketService.generateTrainSeatingConfig()),
          },
        }),
      ]);
      const seatConfig: ISeatConfig = JSON.parse(newSeatingConfig.config as any);
      const totalSeats = seatConfig.lowerBerthMaxSeats + seatConfig.generalBerthMaxSeats + seatConfig.racBerthMaxSeats + seatConfig.waitingListMaxSeats;

      res.status(200).json({ message: "Train timings added successfully", data: { ...newTrainTiming, totalSeats } });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }



  private initializeRoutes(): void {
    
    this.router.get("/trains/timings/:trainUniqueId", this.getTrainTimings);
    this.router.post("/trains/timings", this.addTrainTimings);
  }

  public getRouter(): Router {
    return this.router;
  }
}
