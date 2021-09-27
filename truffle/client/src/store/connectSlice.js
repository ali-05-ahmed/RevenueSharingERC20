import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    ChainId,
    Token,
    WETH,
    Fetcher, Percent,
    Trade,
    Route,
    TokenAmount,
    TradeType,
} from "@uniswap/sdk";
import Web3 from 'web3'
import UniswapV2Router02 from '../contracts/uniswapAbi.json'
import WETHcon from '../contracts/WETHabi.json'


export const web3init = createAsyncThunk(
    "web3init",
    async (data, thunkAPI) => {
        try {
            if (Web3.givenProvider) {
                const web3 = new Web3(Web3.givenProvider)
                await Web3.givenProvider.enable()
                const address = await web3.eth.getAccounts()

                const uniswapv2address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                const DAIaddress = "0xad6d458402f60fd3bd25163575031acdce07538d"
                const uniswapV2constract = await new web3.eth.Contract(UniswapV2Router02.abi, uniswapv2address)
                //    const WETH = await uniswapV2constract.methods.WETH().call()

                console.log(address)
                return {
                    web3, address: address[0], DAIaddress, uniswapV2constract
                }
            }
        } catch (error) {

        }
    }
)


export const web3Reload = createAsyncThunk(
    "web3Reload",
    async (data, thunkAPI) => {
        try {
            if (Web3.givenProvider) {
                const web3 = new Web3(Web3.givenProvider)

                const address = await web3.eth.getAccounts()

                const contractName = await UniswapV2Router02.contractName;

                const uniswapv2address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                const DAIaddress = "0xad6d458402f60fd3bd25163575031acdce07538d"
                const uniswapV2constract = await new web3.eth.Contract(UniswapV2Router02.abi, uniswapv2address)
                // const WETH = await uniswapV2constract.methods.WETH().call()
                // const WETHcontract = await new web3.eth.Contract(WETHcon.abi, WETH)

                console.log(address)
                return {
                    web3, address: address[0], DAIaddress, uniswapV2constract, contractName
                }
            }
        } catch (error) {

        }
    }
)
export const WETHapprove = createAsyncThunk(
    "WETHapprove",
    async (data, thunkAPI) => {
        try {
            const { web3, address, uniswapV2constract, WETH } = thunkAPI.getState().connectReducer

            const WETHcontract = await new web3.eth.Contract(WETHcon.abi, WETH)

            const approve = await WETHcontract.methods.approve(uniswapV2constract)
        } catch (error) {

        }
    }
)

export const uniswapSdkP = createAsyncThunk(
    'uniswapSdkP',
    async (data, thunkAPI) => {
        try {

            const { web3, address, uniswapV2constract } = thunkAPI.getState().connectReducer
            const chainId = ChainId.ROPSTEN
            const DAI = new Token(
                ChainId.ROPSTEN,
                web3.utils.toChecksumAddress("0xad6d458402f60fd3bd25163575031acdce07538d"),
                18
            );
            const weth = WETH[chainId]
            const pair = await Fetcher.fetchPairData(DAI, weth);
            const route = new Route([pair], weth)
            console.log(route.midPrice.toSignificant(6))
            console.log(route.midPrice.invert().toSignificant(6))

        } catch (error) {

        }
    }
)

export const swap = createAsyncThunk(
    'swap',
    async (data, thunkAPI) => {
        try {

            const { web3, address, uniswapV2constract } = thunkAPI.getState().connectReducer
            console.log(ChainId.ROPSTEN)
            const DAI = new Token(
                ChainId.ROPSTEN,
                await web3.utils.toChecksumAddress("0xad6d458402f60fd3bd25163575031acdce07538d"),
                18
            );

            // note that you may want/need to handle this async code differently,s
            // for example if top-level await is not an option
            const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId]);

            const route = new Route([pair], WETH[DAI.chainId]);

            const amountIn = "100000000000000000"; // 1 WETH

            const trade = new Trade(
                route,
                new TokenAmount(WETH[DAI.chainId], amountIn),
                TradeType.EXACT_INPUT
            );
            const slippageTolerance = new Percent("50", "10000"); // 50 bips, or 0.50%
            const uniswapv2address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
            const amountOutMin = String(trade.minimumAmountOut(slippageTolerance).raw); // needs to be converted to e.g. hex
            const path = [WETH[DAI.chainId].address, DAI.address];
            const to = ""; // should be a checksummed recipient address
            const deadline = Math.floor(Date.now() / 1000) + 60 * 30; // 20 minutes from the current Unix time
            const value = String(trade.inputAmount.raw); // // needs to be converted to e.g. hex
            //     const approve = await WETHcontract.methods.approve(uniswapv2address, getAmountsOut[1]).send({ from: address })
            const swapResult = await uniswapV2constract.methods.swapExactETHForTokens(amountOutMin, path, address, deadline).send({ from: address, value: value, gasPrice: 20e9 })

        } catch (error) {
            console.log(error)
        }
    }
)

export const swapDaiEth = createAsyncThunk(
    "swapDaiEth",
    async (data, thunkAPI) => {
        try {
            const { web3, address, uniswapV2constract, WETH, DAIaddress } = thunkAPI.getState().connectReducer
            const DAIvalue = await web3.utils.toWei('100', 'ether');
            const getAmountsOut = await uniswapV2constract.methods.getAmountsOut(DAIvalue, [DAIaddress, WETH]).call()
            //  const getAmountsIn = await uniswapV2constract.methods.getAmountsIn(DAIvalue, [WETH, DAIaddress]).call()
            const ETHvalue = await web3.utils.fromWei(getAmountsOut[1], 'ether');
            const WETHcontract = await new web3.eth.Contract(WETHcon.abi, WETH)
            const uniswapv2address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
            const approve = await WETHcontract.methods.approve(uniswapv2address, getAmountsOut[1]).send({ from: address })
            const swapResult = await uniswapV2constract.methods.swapExactETHForTokens(getAmountsOut[1], [WETH, DAIaddress], address, 15).send({ from: address, value: getAmountsOut[1] })
            //   const ETHvalue = await web3.utils.fromWei(getAmountsIn, 'ether');
            console.log(swapResult)

        }
        catch (error) {
            console.log(error)
        }
    }
)


const connectSlice = createSlice(
    {
        name: 'connectSlice',
        initialState: {
            web3: null,
            address: null,
            name: 'ali',
            msg: null,
            contractName: null,
            uniswapV2constract: null,
            DAIaddress: null,
            WETH: null
        },
        reducers: {

        }, extraReducers: {
            [web3init.fulfilled]: (state, action) => {
                try {
                    state.web3 = action.payload.web3
                    state.address = action.payload.address
                    state.uniswapV2constract = action.payload.uniswapV2constract
                    state.DAIaddress = action.payload.DAIaddress
                    //    state.WETH = action.payload.WETH
                } catch (error) {
                    console.log(error.message)
                    //       state.msg = error
                }

            },
            [web3Reload.fulfilled]: (state, action) => {
                try {
                    state.web3 = action.payload.web3
                    state.address = action.payload.address
                    state.uniswapV2constract = action.payload.uniswapV2constract
                    state.DAIaddress = action.payload.DAIaddress
                    //        state.WETH = action.payload.WETH
                    state.contractName = action.payload.contractName
                } catch (error) {

                }
            }
            ,
            [web3Reload.rejected]: (state, action) => {
                state.web3 = null
                state.address = null
                state.msg = "user denied"
            }
            ,
            [web3init.rejected]: (state, action) => {
                console.log("asd")
                state.web3 = null
                state.address = null
                state.msg = "user denied"
            }
        }
    }
)

export const connectReducer = connectSlice.reducer