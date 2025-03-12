# 1 Adding a train journery
curl --request POST \
  --url http://localhost:4000/api/v1/trains/timings \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.1.1' \
  --data '{
	"trainNo": "HOW-BRD Satabdi",
	"source": "Howrah",
	"destination": "Bardhaman",
	"sourceTime": "2025-03-13T05:45:00.000Z",
	"destinationTime": "2025-03-13T08:00:00.000Z"
}'

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

# 2 Book Ticket for a Train Journey (trainUniqueId) is the ref:
