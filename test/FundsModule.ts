import {
    PoolContract, PoolInstance, 
    FundsModuleContract, FundsModuleInstance, 
    CurveModuleContract, CurveModuleInstance,
    PTokenContract, PTokenInstance, 
    TestLiquidTokenInstance, TestLiquidTokenContract
} from "../types/truffle-contracts/index";
// tslint:disable-next-line:no-var-requires
const { BN, constants, expectEvent, shouldFail } = require("@openzeppelin/test-helpers");
// tslint:disable-next-line:no-var-requires
const should = require("chai").should();
var expect = require("chai").expect;
const w3random = require("./utils/w3random");

const Pool = artifacts.require("Pool");
const FundsModule = artifacts.require("FundsModule");
const CurveModule = artifacts.require("CurveModule");

const PToken = artifacts.require("PToken");
const TestLiquidToken = artifacts.require("TestLiquidToken");

contract("FundsModule", async ([_, owner, liquidityProvider, borrower, ...otherAccounts]) => {
    let pool: PoolInstance;
    let funds: FundsModuleInstance; 
    let curve: CurveModuleInstance; 
    let pToken: PTokenInstance;
    let lToken: TestLiquidTokenInstance;
  
    beforeEach(async () => {
        //Setup system contracts
        pool = await Pool.new();
        await pool.initialize(owner, {from: owner});

        lToken = await TestLiquidToken.new();
        await (<any> lToken).methods['initialize(address)'](owner, {from: owner});

        pToken = await PToken.new();
        await (<any> pToken).methods['initialize(address)'](owner, {from: owner});

        funds = await FundsModule.new();
        await (<any> funds).methods['initialize(address,address,address,address)'](owner, pool.address, lToken.address, pToken.address, {from: owner});
        await pool.set("funds", funds.address, true, {from: owner});  
        await pToken.addMinter(funds.address, {from: owner});

        curve = await CurveModule.new();
        await (<any> curve).methods['initialize(address,address)'](owner, pool.address, {from: owner});
        await pool.set("curve", curve.address, true, {from: owner});  

        //Do common tasks
        lToken.mint(liquidityProvider, web3.utils.toWei('100000'), {from: owner});
        await lToken.approve(funds.address, web3.utils.toWei('100000'), {from: liquidityProvider})

    });
  
    it('should allow deposit if no debts', async () => {
        let amountWeiLToken = w3random.interval(1, 100000, 'ether');
        let receipt = await funds.deposit(amountWeiLToken, {from: liquidityProvider});
        let totalLiquidAssets = await lToken.balanceOf(funds.address);
        expectEvent(receipt, 'Deposit', {'sender':liquidityProvider, 'liquidTokenAmount':totalLiquidAssets});
        let lpBalance = await pToken.balanceOf(liquidityProvider);
        expect(lpBalance).to.be.bignumber.gt('0');
    });
    // it('should allow withdraw if no debts', async () => {
    // });

    // it('should not allow deposit if there are debts', async () => {
    // });
    // it('should not allow withdraw if there are debts', async () => {
    // });

    // it('should create several debt proposals and lock user tokens', async () => {
    // });
    // it('should create pledge in debt proposal', async () => {
    // });
    // it('should withdraw pledge in debt proposal', async () => {
    // });
    // it('should borrow for successful debt proposal', async () => {
    // });
    // it('should repay debt', async () => {
    // });
    // it('should partially redeem pledge from debt', async () => {
    // });
    // it('should fully redeem pledge from fully paid debt (without partial redeem)', async () => {
    // });
    // it('should fully redeem pledge from fully paid debt (after partial redeem)', async () => {
    // });

});