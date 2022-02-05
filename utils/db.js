const { ObjectId } = require('mongodb')
const MongoClient = require('mongodb').MongoClient


const initializeClient = () => {
    try {
        const uri = process.env.MONGO_URI
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  })
        client.connect()
        const getClient = () => client
        return {client, getClient}
    }
    catch(err) {
        console.log(err)
    }
}

const { client, getClient } = initializeClient()

updateProjectData = async (chainData, client) => {
    try {
        const database = client.db('FGS')
        const collection = database.collection('Project')
        chainData.timestamp = Date.now()
        let newChainData = Object.assign({}, chainData)
        newChainData._id = ObjectId()
        let deleteResult = await collection.deleteMany( { timestamp : {"$lt" : Date.now() - 60 * 1000 }}) 
        console.log(`Deleted: ${deleteResult.deletedCount}`)
        await collection.insertOne(newChainData)
        console.log("Inserted new entries")
    } 
    catch(err) {
        console.log(err)
    }
}


getCachedProjectData = async (client) => {
    try {
        const database = client.db('FGS')
        const collection = database.collection('Project')
        cachedData = await collection.find().sort({ _id: -1 }).limit(1).toArray()
        cachedData = cachedData[0]
        return cachedData    
    } 
    catch(err) {
        console.log(err)
    }
}


module.exports = {
    getClient,
    updateProjectData,
    getCachedProjectData
}

