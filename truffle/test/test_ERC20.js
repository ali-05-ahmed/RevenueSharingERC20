const Apitoken = artifacts.require("Apitoken");
const toBN = web3.utils.toBN;
const addresses = ["0x811b661D41338fa570daa263F45d0Db2FAAaA66f",
    "0x7Bf7f20c60aCd092f5654a2d228f74323aeBc23A",
    "0x50bE407D808f5CBB70a7e691c14C63Ce8FC845a6",
    "0x07d16242b132021eAcD3dD37e5B7F82bFf4dE557",
    "0x3242C8460E6262492433890385D4878d08F6cf35"]

const shares = [80, 7, 7, 5, 1]
const { expect } = require('chai');

contract("Apitoken inital test", async accounts => {
    let apitoken = null
    before(async () => {
        apitoken = await Apitoken.deployed();
    })
    it("should put shares as Apitoken in all accounts account", async () => {

        const contractAddress = await apitoken.address
        console.log(contractAddress)
    });
    it("should get 100 shares", async () => {
        const totalPayees = await apitoken.totalPayees()

        assert.equal(totalPayees.toNumber(), 5, "this is not euqal")
        //console.log(assert.typeOf(totalPayees.toNumber()))
    });
    it("should get all shares", async () => {
        const totalShares = await apitoken.totalShares()
        assert.equal(toBN(totalShares).toString(), '100000000000000000000', "shares are not equal")
    })

    describe("first", () => {

    })
});
