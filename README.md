
---

# **Train Ticket Booking and Cancellation - API Testing Documentation**


## Run in dev
#### set env
> DATABASE_URL="file:./dev.db"
> PORT=4000

# API Docs Begin
## 🚀 Getting Started

### Installation & Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Run Prisma migrations:
   ```sh
   npx prisma migrate dev
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
---

## 📌 API Endpoints

### 1️⃣ Create Train Timings  
**Endpoint:** `POST /api/v1/trains/timings`  
**Request:**
```sh
curl --request POST \
  --url http://localhost:4000/api/v1/trains/timings \
  --header 'Content-Type: application/json' \
  --data '{
	"trainNo": "HOW-BRD Satabdi",
	"source": "Howrah",
	"destination": "Bardhaman",
	"sourceTime": "2025-03-13T05:45:00.000Z",
	"destinationTime": "2025-03-13T08:00:00.000Z"
}'
```
**Response:**
```json
{
	"message": "Train timings added successfully",
	"data": {
		"id": 1,
		"trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
		"trainNo": "HOW-BRD Satabdi",
		"source": "Howrah",
		"destination": "Bardhaman",
		"sourceTime": "2025-03-13T05:45:00.000Z",
		"destinationTime": "2025-03-13T08:00:00.000Z",
		"totalSeats": 91
	}
}
```

---

### 2️⃣ Get Train Timing Details  
**Endpoint:** `GET /api/v1/trains/timings/{trainUniqueId}`  
**Request:**
```sh
curl --request GET \
  --url http://localhost:4000/api/v1/trains/timings/41f96793-4390-418c-935b-a06f701fe1bd
```

---

### 3️⃣ Book a Ticket  
**Endpoint:** `POST /api/v1/tickets/book`  
**Request:**
```sh
curl --request POST \
  --url http://localhost:4000/api/v1/tickets/book \
  --header 'Content-Type: application/json' \
  --data '{
	"trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
	"phone": "6291048482",
	"passengers": [
		{ "name": "Rahul", "dob": "1998-04-30", "gender": "male" },
		{ "name": "Singh", "dob": "1945-04-30", "gender": "male" }
	]
}'
```

---

### 4️⃣ Fetch Ticket Details  
**Endpoint:** `GET /api/v1/tickets/ticket/{ticketId}`  
**Request:**
```sh
curl --request GET \
  --url http://localhost:4000/api/v1/tickets/ticket/a1a0419b-72a9-4255-9e57-0f7954a27c34
```

---

### 5️⃣ Delete a Booked Ticket  
**Endpoint:** `DELETE /api/v1/tickets/ticket/{ticketId}`  
**Request:**
```sh
curl --request DELETE \
  --url http://localhost:4000/api/v1/tickets/ticket/ba0acce2-e3d0-4a20-ac26-48a8b68f2b75
```

---

💡 *Ensure that your server is running before making API requests.* 🚄

# Api Docs End


#### ======================================
# Testing The Cancellation
#### ======================================
## **1. Adding a Train Journey**
### **Request**
**Endpoint:**  
`POST http://localhost:4000/api/v1/trains/timings`

**Headers:**  
- `Content-Type: application/json`
- `User-Agent: insomnia/10.1.1`

**Request Body:**
```json
{
  "trainNo": "HOW-BRD Satabdi",
  "source": "Howrah",
  "destination": "Bardhaman",
  "sourceTime": "2025-03-13T05:45:00.000Z",
  "destinationTime": "2025-03-13T08:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Train timings added successfully",
  "data": {
    "id": 1,
    "trainUniqueId": "e70ecd6c-a9fe-45fb-a434-b6a8e6a16641",
    "trainNo": "HOW-BRD Satabdi",
    "source": "Howrah",
    "destination": "Bardhaman",
    "sourceTime": "2025-03-13T05:45:00.000Z",
    "destinationTime": "2025-03-13T08:00:00.000Z"
  }
}
```

---

## **2. Booking a Train Ticket**
### **Request**
**Endpoint:**  
`POST http://localhost:4000/api/v1/tickets/book`

**Request Body:**
```json
{
  "trainUniqueId": "8ced5389-0b1b-4241-88b9-9e14662fc6e5",
  "phone": "6291048482",
  "passengers": [
    {
      "name": "suphal",
      "age": "2023-04-30",
      "gender": "male",
      "guardian": {
        "name": "sourav",
        "age": "1998-04-30",
        "gender": "male"
      }
    }
  ]
}
```

---

## **3. Ticket Status Before Cancellation**
The following tickets exist before deletion:

### **General Ticket**
```json
{
  "message": "Ticket details fetched successfully",
  "data": {
    "id": 20,
    "ticketNo": "ba0acce2-e3d0-4a20-ac26-48a8b68f2b75",
    "trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
    "name": "Passenger-22",
    "phone": "6291048422",
    "dob": "1983-11-09",
    "gender": "male",
    "bookedOn": "2025-03-13T07:53:46.072Z",
    "seatNo": "coachNumber:2,seatNo:m2",
    "ticketType": "general"
  }
}
```

### **First RAC Ticket**
```json
{
  "message": "Ticket details fetched successfully",
  "data": {
    "id": 64,
    "ticketNo": "6e76422f-81df-42c5-a643-2e447d3e1513",
    "trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
    "name": "Passenger-73",
    "phone": "6291048473",
    "dob": "1962-01-04",
    "gender": "female",
    "bookedOn": "2025-03-13T07:53:51.817Z",
    "seatNo": "RAC-0",
    "ticketType": "rac"
  }
}
```

### **First Waiting List Ticket**
```json
{
  "message": "Ticket details fetched successfully",
  "data": {
    "id": 82,
    "ticketNo": "a1a0419b-72a9-4255-9e57-0f7954a27c34",
    "trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
    "name": "singh",
    "phone": "6291048482",
    "dob": "1945-04-30",
    "gender": "male",
    "bookedOn": "2025-03-13T07:56:07.912Z",
    "seatNo": "WL-0",
    "ticketType": "waiting"
  }
}
```

---

## **4. Cancelling a Ticket**
### **Request**
**Endpoint:**  
`DELETE http://localhost:4000/api/v1/tickets/ticket/ba0acce2-e3d0-4a20-ac26-48a8b68f2b75`

---

## **5. Ticket Status After Cancellation**
1. **The first RAC ticket (`6e76422f-81df-42c5-a643-2e447d3e1513`) gets promoted to General.**
```json
{
  "message": "Ticket details fetched successfully",
  "data": {
    "id": 64,
    "ticketNo": "6e76422f-81df-42c5-a643-2e447d3e1513",
    "trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
    "name": "Passenger-73",
    "phone": "6291048473",
    "dob": "1962-01-04",
    "gender": "female",
    "bookedOn": "2025-03-13T07:53:51.817Z",
    "seatNo": "coachNumber:2,seatNo:m2",
    "ticketType": "general"
  }
}
```

2. **The first Waiting List ticket (`a1a0419b-72a9-4255-9e57-0f7954a27c34`) gets promoted to RAC.**
```json
{
  "message": "Ticket details fetched successfully",
  "data": {
    "id": 82,
    "ticketNo": "a1a0419b-72a9-4255-9e57-0f7954a27c34",
    "trainUniqueId": "41f96793-4390-418c-935b-a06f701fe1bd",
    "name": "singh",
    "phone": "6291048482",
    "dob": "1945-04-30",
    "gender": "male",
    "bookedOn": "2025-03-13T07:56:07.912Z",
    "seatNo": "RAC:17",
    "ticketType": "rac"
  }
}
```

3. **The Waiting List becomes empty if no more pending requests exist.**

---

## **6. Summary of Ticket Movement on Cancellation**
- When a **General ticket is canceled**, the first **RAC ticket** is promoted to **General** and gets a confirmed seat.
- The first **Waiting List ticket** is promoted to **RAC**.
- The **Waiting List queue shifts** (if more passengers are in the queue).
- If no more waiting passengers exist, the **Waiting List becomes empty**.

---




