// Sample data for testing API endpoints
// Use these as reference when testing the backend

const sampleUsers = [
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    phone: '0712345678',
  },
  {
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    phone: '0787654321',
  },
  {
    email: 'alex.johnson@example.com',
    name: 'Alex Johnson',
    phone: '0798765432',
  },
  {
    email: 'sarah.williams@example.com',
    name: 'Sarah Williams',
    phone: '0709876543',
  },
];

// Test endpoints with cURL examples

/*
CREATE USER:
curl -X POST http://localhost:5000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "0712345678"
  }'

GET ALL USERS:
curl http://localhost:5000/api/users/all

GET USER BY ID:
curl http://localhost:5000/api/users/{userId}

UPDATE USER:
curl -X PATCH http://localhost:5000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "0700000000"
  }'

DELETE USER:
curl -X DELETE http://localhost:5000/api/users/{userId}
*/

export { sampleUsers };
