//We import the Express app from the app.js file and start the server on a specified port. 
// The server listens for incoming requests and logs a message to the console when it is running.
const app = require("./src/app");

// Just defining the port number for the server to listen on.
const PORT = 3000;

// Start the server and listen on the specified port. 
// When the server is running, it logs a message to the console.
// As parameter, we pass a callback function that will be executed once the server starts successfully.
app.listen(PORT, () => {
  console.log(`CommunityHub backend is running on http://localhost:${PORT}`);
});