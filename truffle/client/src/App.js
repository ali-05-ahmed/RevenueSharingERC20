import logo from './logo.svg';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { web3init, web3Reload, swapETHForTokens, getDAI_ETHprice, uniswapSdkP } from './store/connectSlice';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";



const DAI_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
      totalLiquidity
    }
  }
`;

const ETH_PRICE_QUERY = gql`
  query ethPrice {
    bundle(id: "1") {
      ethPrice
    }
  }
`;

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  }),
  cache: new InMemoryCache(),
});

function App() {

  const { loading: ethLoading, data: ethPriceData } = useQuery(ETH_PRICE_QUERY);
  const { loading: daiLoading, data: daiData } = useQuery(DAI_QUERY, {
    variables: {
      tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
  });



  const daiPriceInEth = daiData && daiData.tokens[0].derivedETH;
  const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity;
  //const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice;

  const address = useSelector((state) => {
    return state.connectReducer.address
  })
  const accessMsg = useSelector((state) => {
    return state.connectReducer.msg
  })

  const [name, setName] = useState(null)
  const [email, setEmail] = useState(null)

  const web3 = useSelector((state) => {
    return state.connectReducer.web3
  })
  const dispatch = useDispatch()
  const signmsg = async () => {
    if (name != null && email != null) {
      return await web3.eth.personal.sign(web3.utils.utf8ToHex(name) + web3.utils.utf8ToHex(email), address, "test password!")
    }
  }
  useEffect(() => {
    dispatch(web3Reload())

  }, []);

  // const currentAccount = async () => {
  //   await web3.personal.sign(web3.fromUtf8("Hello from Toptal!"), web3.eth.coinbase, console.log);

  // }

  const connectWallet = () => {
    console.log("button")

    dispatch(web3init())
    console.log(address)

  }




  return (
    <div className="App">
      Address<br></br>
      {address}<br></br>
      {name}
      <label>Sign-Up Form</label>
      <div>
        Name <input type='text' onChange={(e) => {
          e.preventDefault()
          setName(e.target.value)
        }} required ></input>
      </div>
      <div>
        Email <input type='text' onChange={(e) => setEmail(e.target.value)} required ></input>
      </div>
      <button onClick={() => connectWallet()}>Connect</button>
      <button onClick={async () => signmsg()}>Sign</button><br></br>
      <button onClick={() => dispatch(uniswapSdkP())}>click</button><br></br>
      <div>{accessMsg}</div>

      <div>
        Dai price:{" "}
        {ethLoading || daiLoading
          ? "Loading token data..."
          : "$" +
          // parse responses as floats and fix to 2 decimals
          (parseFloat(daiPriceInEth) * parseFloat(1)).toFixed(2)}
      </div>
      <div>
        Dai total liquidity:{" "}
        {daiLoading
          ? "Loading token data..."
          : // display the total amount of DAI spread across all pools
          parseFloat(daiTotalLiquidity).toFixed(0)}
      </div>

    </div >
  );
}

export default App;
