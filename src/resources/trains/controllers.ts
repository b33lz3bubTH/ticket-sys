import { Router, Request, Response } from "express";
import { PrismaSingleton } from "../../plugins/datasource/db";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

export class TrainsController {
  private router: Router;

  constructor(private prisma: PrismaClient = PrismaSingleton.getInstance()) {
    this.router = Router();
    this.initializeRoutes();
  }

  private addTrainTimings = async (req: Request, res: Response) => {
    try {
      const { trainNo, source, destination, sourceTime, destinationTime } = req.body as any;

      if (!trainNo || !source || !destination || !sourceTime || !destinationTime) {
        throw new Error("Missing required fields");
      }

      const newTrainTiming = await this.prisma.trainTiming.create({
        data: {
          trainUniqueId: uuidv4(),
          trainNo,
          source,
          destination,
          sourceTime,
          destinationTime,
        },
      });

      res.status(200).json({ message: "Train timings added successfully", data: newTrainTiming });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }



  private initializeRoutes(): void {
    this.router.post("/trains/timings", this.addTrainTimings);
  }

  public getRouter(): Router {
    return this.router;
  }
}
