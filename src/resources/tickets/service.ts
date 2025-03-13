import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "@prisma/client"
import { PrismaSingleton } from "../../plugins/datasource/db"
import { ISeatConfig } from "../../types"
import { IPassenger } from "./dtos";

type TicketType = "lower" | "general" | "rac" | "waiting";
const ticketTypesContants = {
  lower: "lower",
  general: "general",
  rac: "rac",
  waiting: "waiting"
}

export class TicketService {
  constructor(private prisma: PrismaClient = PrismaSingleton.getInstance()) { }

  generateTrainSeatingConfig() {
    // A: [ {taken: false, tiketNo: ""} ] lower berth is array of 18 confim seats 
    // B: [] Rest of the 45 are confirm seats
    // C: [] 18 RAC seats // side lower
    // D: [] 10 Waiting List
    // A -> SeatConf -> { 0: "1st lower berth", 1: "2nd lower berth"}
    // B -> SeatConf -> { 0: "m1",  }
    // { confirmedTickets: 0, totalTickets: sum(a.lenght, b.lenght, c.lenght, d.lenght) }
    //
    const trainSeatingConfig: ISeatConfig = {
      lowerBerth: [],
      lowerBerthMaxSeats: 18,
      generalBerth: [],
      generalBerthMaxSeats: 45,
      racBerth: [],
      racBerthMaxSeats: 18,
      waitingLists: [],
      waitingListMaxSeats: 10,
      lowerBerthSeatConfig: { 0: "1st lower berth", 1: "2nd lower berth" },
      generalBerthSeatConfig: { 0: "m1", 1: "up1", 2: "m2", 3: "up2", 4: "side upper 1" },
    }
    return trainSeatingConfig
  }

  async getTrainSeatingConfig(trainUniqueId: string) {
    const trainSeatingConfig = await this.prisma.trainConfig.findFirstOrThrow({
      where: { trainUniqueId }
    });

    return { trainSeatingConfig: JSON.parse(trainSeatingConfig.config as any) as ISeatConfig, trainConfigId: trainSeatingConfig.id }

  }

  async bookTicket(passengers: Array<IPassenger>, trainUniqueId: string, phone: string) {
    const { trainSeatingConfig, trainConfigId } = await this.getTrainSeatingConfig(trainUniqueId);
    const bookedTickets: any[] = [];
    const failedPassengers: { name: string; reason: string }[] = [];

    for (const passenger of passengers) {
      const age = new Date().getFullYear() - new Date(passenger.dob).getFullYear();
      let allocatedBerth: TicketType | null = null;
      let allocatedIndex: number | null = null;
      let seatNo: string | null = null;
      const ticketNo = uuidv4();

      // **Prioritize Lower Berth for Children (<5) & Seniors (>60)**
      if (age < 5 || age > 60) {
        // preference lowerberth
        if (trainSeatingConfig.lowerBerth.length < trainSeatingConfig.lowerBerthMaxSeats) {
          allocatedBerth = ticketTypesContants.lower as TicketType;
          allocatedIndex = trainSeatingConfig.lowerBerth.length;

          const coachNumber = Math.floor(allocatedIndex / 2);
          const seatIdx = String(allocatedIndex % 2) as keyof typeof trainSeatingConfig.lowerBerthSeatConfig; // Ensure valid key
          const berthName = trainSeatingConfig.lowerBerthSeatConfig?.[seatIdx];

          seatNo = `coachNumber:${coachNumber},seatNo:${berthName}`;
          trainSeatingConfig.lowerBerth.push({ taken: true, ticketNo });
        }
        // if all booked general seats
        else if (trainSeatingConfig.generalBerth.length < trainSeatingConfig.generalBerthMaxSeats) {
          allocatedBerth = ticketTypesContants.general as TicketType;
          allocatedIndex = trainSeatingConfig.generalBerth.length;

          const coachNumber = Math.floor(allocatedIndex / 5);
          const seatIdx = String(allocatedIndex % 5) as keyof typeof trainSeatingConfig.generalBerthSeatConfig; // Ensure valid key
          const berthName = trainSeatingConfig.generalBerthSeatConfig?.[seatIdx];

          seatNo = `coachNumber:${coachNumber},seatNo:${berthName}`;
          trainSeatingConfig.generalBerth.push({ taken: true, ticketNo });
        }
      } else {
        if (trainSeatingConfig.generalBerth.length < trainSeatingConfig.generalBerthMaxSeats) {
          allocatedBerth = ticketTypesContants.general as TicketType;
          allocatedIndex = trainSeatingConfig.generalBerth.length;

          const coachNumber = Math.floor(allocatedIndex / 5);
          const seatIdx = String(allocatedIndex % 5) as keyof typeof trainSeatingConfig.generalBerthSeatConfig; // Ensure valid key
          const berthName = trainSeatingConfig.generalBerthSeatConfig?.[seatIdx];

          seatNo = `coachNumber:${coachNumber},seatNo:${berthName}`;

          trainSeatingConfig.generalBerth.push({ taken: true, ticketNo });
        } else if (trainSeatingConfig.lowerBerth.length < trainSeatingConfig.lowerBerthMaxSeats) {

          allocatedBerth = ticketTypesContants.lower as TicketType;
          allocatedIndex = trainSeatingConfig.lowerBerth.length;

          const coachNumber = Math.floor(allocatedIndex / 2);
          const seatIdx = String(allocatedIndex % 2) as keyof typeof trainSeatingConfig.lowerBerthSeatConfig; // Ensure valid key
          const berthName = trainSeatingConfig.lowerBerthSeatConfig?.[seatIdx];

          seatNo = `coachNumber:${coachNumber},seatNo:${berthName}`;

          trainSeatingConfig.lowerBerth.push({ taken: true, ticketNo });
        }
      }

      // If Neither General nor Lower Berth is Available, Try RAC
      if (!allocatedBerth && trainSeatingConfig.racBerth.length < trainSeatingConfig.racBerthMaxSeats) {
        allocatedBerth = "rac";
        allocatedIndex = trainSeatingConfig.racBerth.length;
        seatNo = `RAC-${allocatedIndex}`;
        trainSeatingConfig.racBerth.push({ taken: true, ticketNo });
      }
      // If RAC is Full, Try Waiting List
      else if (!allocatedBerth && trainSeatingConfig.waitingLists.length < trainSeatingConfig.waitingListMaxSeats) {
        allocatedBerth = "waiting";
        allocatedIndex = trainSeatingConfig.waitingLists.length;
        seatNo = `WL-${allocatedIndex}`;
        trainSeatingConfig.waitingLists.push({ taken: true, ticketNo });
      }
      // If No Space Available, Reject Ticket
      else if (!allocatedBerth) {
        failedPassengers.push({ name: passenger.name, reason: "No seats available in any category" });
        continue;
      }

      // Store Ticket Details
      bookedTickets.push({
        ticketNo,
        trainUniqueId,
        name: passenger.name,
        dob: passenger.dob,
        gender: passenger.gender,
        bookedOn: new Date(),
        phone,
        seatNo,
        ticketType: allocatedBerth,
      });
    }

    // If no passengers could be booked, throw an error
    if (bookedTickets.length === 0) {
      throw new Error("No tickets available. Booking failed for all passengers.");
    }

    // Save bookings to database
    await this.prisma.$transaction([
      this.prisma.trainConfig.update({
        where: { id: trainConfigId },
        data: { config: JSON.stringify(trainSeatingConfig) }
      }),
      this.prisma.tickets.createMany({
        data: bookedTickets,
      })
    ]);

    // Return success and failure responses
    return {
      bookedTickets,
      failedPassengers,
    };
  }


  getTicketDetails(ticketNo: string) {
    return this.prisma.tickets.findFirstOrThrow({
      where: { ticketNo }
    })

  }

  async cancelTicket(ticketNo: string) {
    const ticket = await this.getTicketDetails(ticketNo);
    const { trainConfigId, trainSeatingConfig } = await this.getTrainSeatingConfig(ticket.trainUniqueId);

    let updatedTrainConfig = { ...trainSeatingConfig };
    let movedToGeneral: any[] = [];
    let movedToRAC: any[] = [];
    let ticketUpdates: any[] = [];

    // Remove the canceled ticket from the berth list
    if (ticket.ticketType === ticketTypesContants.lower) {
      updatedTrainConfig.lowerBerth = updatedTrainConfig.lowerBerth.filter(seat => seat.ticketNo !== ticketNo);
    } else if (ticket.ticketType === ticketTypesContants.general) {
      updatedTrainConfig.generalBerth = updatedTrainConfig.generalBerth.filter(seat => seat.ticketNo !== ticketNo);
    } else if (ticket.ticketType === ticketTypesContants.rac) {
      updatedTrainConfig.racBerth = updatedTrainConfig.racBerth.filter(seat => seat.ticketNo !== ticketNo);
    } else if (ticket.ticketType === ticketTypesContants.waiting) {
      updatedTrainConfig.waitingLists = updatedTrainConfig.waitingLists.filter(seat => seat.ticketNo !== ticketNo);
    }

    // Move one ticket from RAC to General
    if (updatedTrainConfig.racBerth.length > 0) {
      const racTicketNo = updatedTrainConfig.racBerth[0].ticketNo;
      updatedTrainConfig.racBerth.shift(); // Remove first RAC ticket
      updatedTrainConfig.generalBerth.push({ taken: true, ticketNo: racTicketNo });

      ticketUpdates.push(
        this.prisma.tickets.update({
          where: { ticketNo: racTicketNo },
          data: { ticketType: ticketTypesContants.general, seatNo: ticket.seatNo }
        })
      );

      movedToGeneral.push(racTicketNo);
    }

    // Move one ticket from Waiting List to RAC
    if (updatedTrainConfig.waitingLists.length > 0) {
      const wlTicketNo = updatedTrainConfig.waitingLists[0].ticketNo;
      updatedTrainConfig.waitingLists.shift(); // Remove first Waiting List ticket
      updatedTrainConfig.racBerth.push({ taken: true, ticketNo: wlTicketNo });

      ticketUpdates.push(
        this.prisma.tickets.update({
          where: { ticketNo: wlTicketNo },
          data: { ticketType: ticketTypesContants.rac, seatNo: `RAC:${updatedTrainConfig.racBerth.length - 1}` }
        })
      );

      movedToRAC.push(wlTicketNo);
   }

    // Delete the canceled ticket
    ticketUpdates.push(
      this.prisma.tickets.delete({ where: { ticketNo } })
    );

    // Update DB
    const [newTrainConfig, ...tickets] = await this.prisma.$transaction([
      this.prisma.trainConfig.update({
        where: { id: trainConfigId },
        data: { config: JSON.stringify(updatedTrainConfig) }
      }),
      ...ticketUpdates
    ]);

    // Fetch moved tickets details for notification
    const movedToGeneralTickets = movedToGeneral.length
      ? await this.prisma.tickets.findMany({ where: { ticketNo: { in: movedToGeneral } } })
      : [];

    const movedToRACTickets = movedToRAC.length
      ? await this.prisma.tickets.findMany({ where: { ticketNo: { in: movedToRAC } } })
      : [];

    return {
      newTrainConfig,
      tickets,
      movedToGeneral: movedToGeneralTickets,
      movedToRAC: movedToRACTickets
    };
  }
}
