async function connectToDatabase(client) {
  try {
    await client.connect();
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

module.exports = connectToDatabase;
