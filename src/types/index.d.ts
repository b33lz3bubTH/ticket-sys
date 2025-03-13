
export interface ISeatConfig {
  lowerBerth: any[]
  lowerBerthMaxSeats: number
  generalBerth: any[]
  generalBerthMaxSeats: number
  racBerth: any[]
  racBerthMaxSeats: number
  waitingLists: any[]
  waitingListMaxSeats: number
  lowerBerthSeatConfig: LowerBerthSeatConfig
  generalBerthSeatConfig: GeneralBerthSeatConfig
}

export interface LowerBerthSeatConfig {
  "0": string
  "1": string
}

export interface GeneralBerthSeatConfig {
  "0": string
  "1": string
  "2": string
  "3": string
  "4": string
}
