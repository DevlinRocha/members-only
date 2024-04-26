async function connectToDatabase(client) {
  try {
    await client.connect();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

async function getDoc(collection, parameter, value, client) {
  try {
    const database = client.db(process.env.DATABASE);
    const coll = database.collection(collection);
    const data = await coll.findOne({ [parameter]: value });

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getDocs(
  collection,
  client,
  options = { sortParam: "timeSent", sortTime: -1 }
) {
  const { sortParam, sortTime } = options;

  try {
    const database = client.db(process.env.DATABASE);
    const coll = database.collection(collection);
    const data = await coll
      .find()
      .sort({ [sortParam]: sortTime })
      .toArray();

    return data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  connectToDatabase,
  getDoc,
  getDocs,
};
