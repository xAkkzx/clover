const User = require("./model/user"); // Import your Mongoose model

// Assuming you're inside an async function
try {
    const allUsers = User.find({}); // Find all documents in the collection
    console.log('Retrieved documents:');
    console.log(allUsers);
} catch (error) {
    console.error('Error querying MongoDB:', error);
}