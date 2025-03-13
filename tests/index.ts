import axios from "axios";

const API_URL = "http://localhost:4000/api/v1/tickets/book";
const TRAIN_ID = "";

function getRandomDOB() {
  const startYear = 1950;
  const endYear = new Date().getFullYear(); // Current year

  const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");

  return `${randomYear}-${randomMonth}-${randomDay}`;
}

function calculateAge(dob: any) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function bookSeats() {
  if(!TRAIN_ID){
    console.log("❌ Please provide a valid train ID.");
    return;
  }
  const totalSeats = 91;
  let bookedSeats = 0;

  for (let i = 1; i <= totalSeats; i++) {
    const dob = getRandomDOB();
    const age = calculateAge(dob);

    let requestBody: any;

    if (age < 5) {
      requestBody = {
        trainUniqueId: TRAIN_ID,
        phone: `62910484${String(i).padStart(2, "0")}`, // Unique phone number
        passengers: [
          {
            name: `Passenger-${i}`,
            age: dob,
            gender: i % 2 === 0 ? "male" : "female",
            guardian: {
              name: `Guardian-${i}`,
              age: "1990-04-30", // Fixed guardian age
              gender: i % 2 === 0 ? "male" : "female",
            },
          },
        ],
      };
    } else {
      requestBody = {
        trainUniqueId: TRAIN_ID,
        phone: `62910484${String(i).padStart(2, "0")}`,
        passengers: [
          {
            name: `Passenger-${i}`,
            dob,
            gender: i % 2 === 0 ? "male" : "female",
          },
        ],
      };
    }

    try {
      const response = await axios.post(API_URL, requestBody);

      console.log(`✅ Seat booked for ${requestBody.passengers[0].name} (Age: ${age}):`, response.data);
      bookedSeats++;
    } catch (error: any) {
      console.error(`❌ Failed to book seat for ${requestBody.passengers[0].name}:`, error.response?.data || error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to avoid overwhelming the server
  }

  console.log(`🎉 Booking completed. Total seats booked: ${bookedSeats}/${totalSeats}`);
}

bookSeats();
