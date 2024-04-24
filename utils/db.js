async function connectToDatabase(client) {
  try {
    await client.connect();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

async function getUser(parameter, value, client) {
  try {
    const database = client.db(process.env.DATABASE);
    const users = database.collection("users");
    const data = await users.findOne({ [parameter]: value });

    return data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  connectToDatabase,
  getUser,
};
