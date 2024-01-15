import './App.css';
import React, { Component } from 'react';
import dcaABI from './ContractAbi';
import { createRoot } from 'react-dom/client';
import IERC20ABI from './IERC20Abi';
import Web3 from 'web3';

const dcaAddress = "0xAE246E208ea35B3F23dE72b697D47044FC594D5F";
const erc20TokenAdresses = {
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
}

class DcaApp {
  async init() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      let accounts = await window.ethereum.request(
        { method: 'eth_requestAccounts' }
      );
      this.userAccount = accounts[0]
      this.dcaContract = new this.web3.eth.Contract(dcaABI, dcaAddress);
      this.usdtToken = new this.web3.eth.Contract(IERC20ABI, erc20TokenAdresses['USDT'])
    } else {
      alert("No extension for ethereum found");
    }
    setInterval(async () => {
      // Check if account has changed
      try {
        let tempUserAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });
        tempUserAccount = tempUserAccount[0];
        if (tempUserAccount !== this.userAccount) {
          this.userAccount = tempUserAccount;
        }
      } catch (error) {
        console.log(error);
      }
    }, 1000);
  }

  async getPersonTokenData() {
    let currentAccount = this.userAccount;
    let token_name_to_balance = {};
    for (let key in erc20TokenAdresses) {
      let result = await this.dcaContract.methods.getBalance(
        erc20TokenAdresses[key]
      ).call({
        from: this.userAccount
      });
      token_name_to_balance[key] = result.toString();
    };
    return currentAccount, token_name_to_balance;
  }

  async getUserDcaParams() {
    let currentAccount = this.userAccount;
    let token_name_to_purchaseAmount = {};
    let token_name_to_purchaseInterval = {};
    for (let key in erc20TokenAdresses) {
      let result = await this.dcaContract.methods.getDcaParams(
        [
          erc20TokenAdresses[key],
          erc20TokenAdresses['WETH'],
          3000
        ]
      ).call({
        from: this.userAccount
      });
      
      const { 0: purchaseAmount, 1: purchaseInterval} = result;
      console.log(key, purchaseAmount.toString());
      token_name_to_purchaseAmount[key] = purchaseAmount.toString();
      token_name_to_purchaseInterval[key] = purchaseInterval.toString();
    };
    return {
      currentAccount,
      token_name_to_purchaseAmount,
      token_name_to_purchaseInterval,
    };
  }

  async deposit() {
    const amount = document.getElementById('amount').value;
    const token = document.getElementById('tokenAddress').value;
    console.log('this ---', this.userAccount)
    try {
      // Call the deposit function on the smart contract
      this.usdtToken.methods.approve(dcaAddress, amount).send({ from: this.userAccount });
      console.log('dcaContract --- ', this.dcaContract);
      await this.dcaContract.methods.deposit(
        token, amount
      ).send({ from: this.userAccount });
      alert('Deposit successful!');
    } catch (error) {
      console.log(this.dcaContract)
      console.error('Error depositing funds:', error);
      alert('Error depositing funds. Please check the console for details.');
    }
  }

  async setDcaParams() {
    const purchaseAmount = document.getElementById('purchaseAmount').value;
    const purchaseInterval = document.getElementById('purchaseInterval').value;
    const purchaseAddress = document.getElementById('purchaseAddress').value;
    try {
      // Call the setDCAParameters function on the smart contract
      await this.dcaContract.methods.setDcaParams(
        [
          purchaseAddress,
          erc20TokenAdresses['WETH'],
          3000
        ],
        [
          purchaseAmount,
          purchaseInterval
        ]).send({ from: this.userAccount });
      alert('DCA parameters set successfully!');
    } catch (error) {
      console.error('Error setting DCA parameters:', error);
      alert('Error setting DCA parameters. Please check the console for details.');
    }
  };

  async executeDca() {
    const accounts = await this.web3.eth.getAccounts();

    try {
      // Call the executeDCA function on the smart contract
      await this.dcaContract.methods.executeDCA().send({ from: accounts[0] });
      alert('DCA executed successfully!');
    } catch (error) {
      console.error('Error executing DCA:', error);
      alert('Error executing DCA. Please check the console for details.');
    }
  };
}

class UI extends Component {
  constructor(props) {
    super(props);
    this.dcaApp = new DcaApp();
  };

  async renderBalances() {
    let currentAccount, token_name_to_balance = await this.dcaApp.getPersonTokenData();

    let tokens_to_info = [];
    tokens_to_info.push(<h2 className='balancesSidebar' >Balances</h2>);
    for (let key in token_name_to_balance) {
      tokens_to_info.push(<label htmlFor={String(key)}>
        {key}:&nbsp;
        <p className='tokenName'>{(token_name_to_balance[key])}</p>
      </label>);
    }
    let token_person_data_div = document.getElementById('tokenPersonData');
    const root = createRoot(token_person_data_div);
    root.render(tokens_to_info);
  };

  async renderDcaParams() {
    const { currentAccount, token_name_to_purchaseAmount, token_name_to_purchaseInterval } = await this.dcaApp.getUserDcaParams();
    let tokens_to_info = [];
    tokens_to_info.push(<h2 className='dcaParamsSidebar' >DCA Params</h2>);
    for (let key in token_name_to_purchaseAmount) {
      tokens_to_info.push(<label htmlFor={String(key)}>
        {key}:&nbsp;
        <br />
        <p className='tokenName'>
          Purchase amount: {(token_name_to_purchaseAmount[key])}
          <br />
          Purchase interval: {(token_name_to_purchaseInterval[key])}
        </p>
      </label>);
    }
    let token_dcaParams_div = document.getElementById('tokenDcaParams');
    const root = createRoot(token_dcaParams_div);
    root.render(tokens_to_info);
  };

  async componentDidMount() {
    // Asynchronously initialize DcaApp
    await this.dcaApp.init();
    this.setState({ isInitialized: true });
    await this.renderBalances();
    await this.renderDcaParams();
  };

  handleDepositClick = async () => {
    // Check if initialization is complete before calling deposit
    if (this.state.isInitialized) {
      await this.dcaApp.deposit();
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  };

  handleSetParamsClick = async () => {
    if (this.state.isInitialized) {
      await this.dcaApp.setDcaParams();
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }

  handleExecuteDcaClick = async () => {
    if (this.state.isInitialized) {
      // if (this.state.dcaParamsSet) {
      //   await this.dcaApp.executeDca()
      // } else {
      //   alert('DCA params is not set yet. First set params.');
      // }
      await this.dcaApp.executeDca();
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }
  
  handleRefreshBalancesClick = async () => {
    if (this.state.isInitialized) {
      await this.renderBalances()
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }

  handleRefreshDcaParamsClick = async () => {
    if (this.state.isInitialized) {
      await this.renderDcaParams()
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }
// TODO: write func for updating balances
  render() {
    return (<section>
      <div className="box">
        <div className="token form">
          <h2>DCA Smart Contract Interaction</h2>
          <form>
            <div class="inputBx">
              <label htmlFor="tokenAddress">Token Address:</label>
              <input type="text" id="tokenAddress" placeholder="Enter token address"></input>
            </div>
            <div className="inputBx">
              <label htmlFor="amount">Amount:</label>
              <input type="text" id="amount" placeholder="Enter amount" />
              <button onClick={this.handleDepositClick} type='button'>Deposit</button>
            </div>
            <div className="inputBx">
            <label htmlFor="ethAmount">Token Address:</label>
              <input
                type="text"
                id="purchaseAddress"
                placeholder="Enter purchase token address"
              />
            </div>
            <div className="inputBx">
            <label htmlFor="ethAmount">Token Amount:</label>
              <input
                type="text"
                id="purchaseAmount"
                placeholder="Enter purchase amount"
              />
            </div>
            <div className="inputBx">
              <label htmlFor="ethAmount">Interval:</label>
              <input
                type="text"
                id="purchaseInterval"
                placeholder="Enter purchase interval"
              />
              <button onClick={this.handleSetParamsClick} type='button'>
                Set DCA Parameters
              </button>
            </div>
            <div class="inputBx">
              <button onClick={this.dcaApp.executeDca} type='button'>Execute DCA</button>
            </div>
          </form>
        </div>
        <div className="token persondata" id='tokenPersonData'>
          <label htmlFor="token">
            token:
            <p> a </p>
          </label>
        </div>
        <div className="token dcaparams" id='tokenDcaParams'>
          <label htmlFor="token">
            token:
            <p> a </p>
          </label>
        </div>
        
        <button onClick={this.handleRefreshBalancesClick} type='button'>
            Refresh balances
        </button>
        <button onClick={this.handleRefreshDcaParamsClick} type='button'>
            Refresh DCA params
        </button>
      </div>
    </section>
    );
  }
}


export default UI;
