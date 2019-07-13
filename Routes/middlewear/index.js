const express = require("express")
const router = express.Router()
const conf = require("../conf.js")
const Web3 = require("web3")



const setDefault = (bc) => {

  bc.accounts.getPublicAddresses()
  .then((addresses)=>{
      if (addresses.length === 0)
        return;
      bc.accounts.loadWallet(addresses[addresses.length-1], "pass1234")
      .then((account)=>{
        bc.accounts.setDefaultAccount(account)
        .then((res)=>{
          console.log("set default: " + res)
        })
        .catch((err)=>{
          console.log("error", err)
        })
      })
      
  })
}

if (typeof web3 === 'undefined') {
  web3 = new Web3(conf.web3HttpHost);
  console.log("set host: ", web3.currentProvider.host)
  bc = require("../../BlockChain")(web3);
  setDefault(bc)
}

const web3Inject = (req, res, next) => {
    if (typeof web3 === 'undefined') {
      web3 = new Web3(conf.web3HttpHost);
      req.web3 = web3;
    }
    req.web3 = web3
    req.bc = require("../../BlockChain")(web3);

    if (req.web3.eth.defaultAccount == null)
      setDefault(req.bc)

    next();
}

const setHeaders = (req, res, next) => {
    res.set('content-type', 'application/json')
    next()
}

const auth = (req, res, next) => {
    req.bc.auth.getUserConfirmation(req, res)
    .then(next)
    .catch(console.error)
}
const log = (req, res, next) => {
  console.log(req.url + " data=" + JSON.stringify(req.body))
  next()
}

router.use(log)
router.use(web3Inject)
router.use(setHeaders)
//router.use(auth)


module.exports = router;
