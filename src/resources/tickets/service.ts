import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "@prisma/client"
import { PrismaSingleton } from "../../plugins/datasource/db"
import { ISeatConfig } from "../../types"
import { IPassenger } from "./dtos";

type TicketType = "lower" | "general" | "rac" | "waiting";
const ticketTypesConstants = {
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
      let seatNo: string | null = null;
      const ticketNo = uuidv4();

      // **Function to find an available (previously canceled) seat or next free seat**
      const findAvailableSeat = (berthArray: any[], maxSeats: number, seatConfig: any, perCoach: number) => {
        let seatIndex = berthArray.findIndex(seat => !seat.taken);
        if (seatIndex === -1 && berthArray.length < maxSeats) {
          seatIndex = berthArray.length; // Assign a new seat if all taken
        }
        if (seatIndex !== -1) {
          const coachNumber = Math.floor(seatIndex / perCoach);
          const seatIdx = String(seatIndex % perCoach) as keyof typeof seatConfig;
          return {
            seatNo: `coachNumber:${coachNumber},seatNo:${seatConfig[seatIdx]}`,
            seatIndex
          };
        }
        return null;
      };

      // **1. Prioritize Lower Berth for Children (<5) & Seniors (>60)**
      if ((age < 5 || age > 60)) {
        const availableSeat = findAvailableSeat(
          trainSeatingConfig.lowerBerth,
          trainSeatingConfig.lowerBerthMaxSeats,
          trainSeatingConfig.lowerBerthSeatConfig,
          2
        );
        if (availableSeat) {
          allocatedBerth = ticketTypesConstants.lower as TicketType;
          seatNo = availableSeat.seatNo;
          if (trainSeatingConfig.lowerBerth[availableSeat.seatIndex]) {
            trainSeatingConfig.lowerBerth[availableSeat.seatIndex].taken = true;
            trainSeatingConfig.lowerBerth[availableSeat.seatIndex].ticketNo = ticketNo;
          } else {
            trainSeatingConfig.lowerBerth.push({ taken: true, ticketNo });
          }
        }
      }

      // **2. General Berth Allocation**
      if (!allocatedBerth) {
        const availableSeat = findAvailableSeat(
          trainSeatingConfig.generalBerth,
          trainSeatingConfig.generalBerthMaxSeats,
          trainSeatingConfig.generalBerthSeatConfig,
          5
        );
        if (availableSeat) {
          allocatedBerth = ticketTypesConstants.general as TicketType;
          seatNo = availableSeat.seatNo;
          if (trainSeatingConfig.generalBerth[availableSeat.seatIndex]) {
            trainSeatingConfig.generalBerth[availableSeat.seatIndex].taken = true;
            trainSeatingConfig.generalBerth[availableSeat.seatIndex].ticketNo = ticketNo;
          } else {
            trainSeatingConfig.generalBerth.push({ taken: true, ticketNo });
          }
        }
      }

      // **3. RAC Berth Allocation**
      if (!allocatedBerth) {
        const availableSeat = findAvailableSeat(
          trainSeatingConfig.racBerth,
          trainSeatingConfig.racBerthMaxSeats,
          {},
          1
        );
        if (availableSeat) {
          allocatedBerth = "rac";
          seatNo = `RAC-${availableSeat.seatIndex}`;
          if (trainSeatingConfig.racBerth[availableSeat.seatIndex]) {
            trainSeatingConfig.racBerth[availableSeat.seatIndex].taken = true;
            trainSeatingConfig.racBerth[availableSeat.seatIndex].ticketNo = ticketNo;
          } else {
            trainSeatingConfig.racBerth.push({ taken: true, ticketNo });
          }
        }
      }

      // **4. Waiting List Allocation**
      if (!allocatedBerth) {
        const availableSeat = findAvailableSeat(
          trainSeatingConfig.waitingLists,
          trainSeatingConfig.waitingListMaxSeats,
          {},
          1
        );
        if (availableSeat) {
          allocatedBerth = "waiting";
          seatNo = `WL-${availableSeat.seatIndex}`;
          if (trainSeatingConfig.waitingLists[availableSeat.seatIndex]) {
            trainSeatingConfig.waitingLists[availableSeat.seatIndex].taken = true;
            trainSeatingConfig.waitingLists[availableSeat.seatIndex].ticketNo = ticketNo;
          } else {
            trainSeatingConfig.waitingLists.push({ taken: true, ticketNo });
          }
        }
      }

      // **5. If No Seats Available, Reject Booking**
      if (!allocatedBerth) {
        failedPassengers.push({ name: passenger.name, reason: "No seats available in any category" });
        continue;
      }

      // **Save the ticket**
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

    if (bookedTickets.length === 0) {
      throw new Error("No tickets available. Booking failed for all passengers.");
    }

    await this.prisma.$transaction([
      this.prisma.trainConfig.update({
        where: { id: trainConfigId },
        data: { config: JSON.stringify(trainSeatingConfig) }
      }),
      this.prisma.tickets.createMany({
        data: bookedTickets,
      })
    ]);

    return { bookedTickets, failedPassengers };
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
    if (ticket.ticketType === ticketTypesConstants.lower) {
      updatedTrainConfig.lowerBerth = updatedTrainConfig.lowerBerth.filter(seat => seat.ticketNo !== ticketNo);
    } else if (ticket.ticketType === ticketTypesConstants.general) {
      updatedTrainConfig.generalBerth = updatedTrainConfig.generalBerth.filter(seat => seat.ticketNo !== ticketNo);
    } else if (ticket.ticketType === ticketTypesConstants.rac) {
      updatedTrainConfig.racBerth = updatedTrainConfig.racBerth.filter(seat => seat.ticketNo !== ticketNo);
    } else if (ticket.ticketType === ticketTypesConstants.waiting) {
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
          data: { ticketType: ticketTypesConstants.general, seatNo: ticket.seatNo }
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
          data: { ticketType: ticketTypesConstants.rac, seatNo: `RAC:${updatedTrainConfig.racBerth.length - 1}` }
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
