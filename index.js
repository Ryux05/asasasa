// server.js
const express = require("express")
const mmH = require("./mm.js"); // Import the scraper function

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());
app.get("/", (req,res) => {
res.json({text:"/delta?url="})  
})

app.get("/delta", async (req, res) => {
  const { url } = req.query; // Extract the 'url' query parameter

  if (!url) {
    return res.status(400).send("Missing parameter: url"); // Use 400 for bad request
  }

  try {
    const urlResult = await mmH(url); // Call the scraper function
    res.status(200).json({ urlResult }); // Respond with the key in JSON format
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: error }); // Return the error message
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
