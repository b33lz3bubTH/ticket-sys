export interface IPassenger {
  name: string;
  dob: string; //2025-03-13
  gender: "male" | "female";
  guardian ?: IPassenger;
}


export const validatePassengers = (passengers: IPassenger[]): { validPassengers: IPassenger[], errors: string[] } => {
  const errors: string[] = [];
  const validPassengers: IPassenger[] = [];
  const currentDate = new Date();

  passengers.forEach((passenger, index) => {
    const dob = new Date(passenger.dob);
    let ageInYears = currentDate.getFullYear() - dob.getFullYear();
    
    const adjustedDob = new Date(dob);
    adjustedDob.setFullYear(dob.getFullYear() + ageInYears);

    if (currentDate < adjustedDob) {
      ageInYears -= 1;
    }

    if (ageInYears < 5 && !passenger.guardian) {
      errors.push(`Passenger at index ${index} (${passenger.name}) requires a guardian.`);
    } else {
      validPassengers.push(passenger);
    }
  });

  return { validPassengers, errors };
};
