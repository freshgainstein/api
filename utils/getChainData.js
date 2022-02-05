const schedule = require("node-schedule") // Used to set schedule for calling Infura to update token data
const Web3 = require("web3") // Used for connecting with node endpoints (Ethereum and BSC for this project) to get live information about on chain data
const sleep = require('ko-sleep'); // Used to set a time delay between retrying Web3 connections
const getProjectData = require("./getProjectData") // Logic for collecting and calculating all data for Project


// const getPriceData = require("./getPriceData") // Unused in this example project


// Function to setup web3 objects for chains to be queried. 

const setupWeb3 = async () => {
  
  // Multiple Binance Smart Chain endpoints are supplied in case one is down. More endpoints can be found at https://docs.binance.org/smart-chain/developer/rpc.html
  const bsc_endpoints = [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
    "https://bsc-dataseed2.defibit.io/",
    "https://bsc-dataseed3.defibit.io/",
    "https://bsc-dataseed4.defibit.io/",
  ]


  let bsc_web3

  // Run through three provided BSC endpoints until a connection is established and a valid web3 object is returned
  while (true){
    for(i=0; i <bsc_endpoints.length; i++) {
      bsc_web3 = await new Web3(new Web3.providers.HttpProvider(bsc_endpoints[i]))
      if (bsc_web3.currentProvider) break
      await sleep(100)
    }
    if (bsc_web3.currentProvider) break
  }
  
  // Return all established web3 objects
  return {bsc_web3}
}
 
// This function passes the established web3 objects to the getProjectOneData and getProjectData functions inside of the schedule functions. The schedule function comes from node-schedule and uses cron syntax which you can experiment with at https://crontab.guru/. I've set it to update every 15 seconds here as it's useful for testing purposes. A less frequent update schedule is recommended for production.
const updateData = async (web3_collection) => {
  schedule.scheduleJob("0,5,10,15,20 * * * * *", async () => {   
    getProjectData(web3_collection)
  })
}

// Here we define a function to call the async setupWeb3 function and use the resolved promise 'web3_collection' as input for updateData which begins the update loop

const getChainData = () => {
  setupWeb3().then((web3_collection) => updateData(web3_collection))
}

module.exports = getChainData
