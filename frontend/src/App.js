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
const tokenDecimals = {
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': 18,
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

      const { 0: purchaseAmount, 1: purchaseInterval } = result;
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
    const token_key = document.getElementById('tokenAddressoptionsDiv1').value;
    const token = erc20TokenAdresses[token_key];
    const amount = document.getElementById('amount').value * 10 ** tokenDecimals[token]
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
    const purchaseInterval = document.getElementById('purchaseInterval').value;
    const token_key = document.getElementById('tokenAddressoptionsDiv2').value;
    const purchaseAddress = erc20TokenAdresses[token_key];
    const purchaseAmount = document.getElementById('purchaseAmount').value * 10 ** 18;
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
    try {
      await this.dcaContract.methods.executeDca(
        [
          erc20TokenAdresses['USDT'],
          erc20TokenAdresses['WETH'],
          3000
        ]
      ).send({ from: this.userAccount });
      alert('DCA executed successfully!');
    } catch (error) {
      if (error.message.includes('purchaseInterval has not passed')) {
        alert('purchaseInterval has not passed. Wait for it. Keep calm.');
      } else {
        console.error('Error executing DCA:', error);
        console.log(error.response)
        alert('Error executing DCA. Please check the console for details.');
      }
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
  show(id, a) {
    return () => {
      document.getElementById(id).value = a
    }
  }
  renderOptions(id) {
    let options = [];
    for (let key in erc20TokenAdresses) {
      options.push(<div onClick={this.show('tokenAddress' + id, key)}>{key}</div>);
    }
    let optionsDiv = document.getElementById(id);
    const root = createRoot(optionsDiv);
    root.render(options);
  }

  activateDropDown(id) {
    let dropdown = document.getElementById(id);
    dropdown.onclick = (function () {
      dropdown.classList.toggle('active')
    });
  }

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
    try {
      await this.renderBalances();
    } catch (error) {
      alert('Error uploading balances. Check your blockchain connection. Check console');
      console.log(error);
    }
    try {
      await this.renderDcaParams();
    } catch (error) {
      alert('Error uploading DCA Parameters. Check your blockchain connection. Check console');
      console.log(error);
    }
    this.renderOptions('optionsDiv1');
    this.renderOptions('optionsDiv2');
    this.activateDropDown('dropdown1');
    this.activateDropDown('dropdown2');
  };

  handleDepositClick = async () => {
    // Check if initialization is complete before calling deposit
    if (this.state.isInitialized) {
      try {
        await this.dcaApp.deposit();
      } catch (error) {
        alert('Check your blockchain connection. Check console');
        console.log(error);
      }
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  };

  handleSetParamsClick = async () => {
    if (this.state.isInitialized) {
      try {
        await this.dcaApp.setDcaParams();
      } catch (error) {
        alert('Check your blockchain connection. Check console');
        console.log(error);
      }
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }

  handleExecuteDcaClick = async () => {
    if (this.state.isInitialized) {
      try {
        await this.dcaApp.executeDca();
      } catch (error) {
        alert('Error execute DCA. Check your blockchain connection. Check console');
      }
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }

  handleRefreshBalancesClick = async () => {
    if (this.state.isInitialized) {
      try {
        await this.renderBalances();
      } catch (error) {
        alert('Error uploading balances. Error Check your blockchain connection. Check console');
        console.log(error);
      }
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }

  handleRefreshDcaParamsClick = async () => {
    if (this.state.isInitialized) {
      try {
        await this.renderDcaParams();
      } catch (error) {
        alert('Error uploading DCA parameters. Check your blockchain connection. Check console');
        console.log(error);
      }
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  }
  render() {
    return (<section>
      <div className="box">
        <div className="token form">
          <h2>DCA Smart Contract Interaction</h2>
          <form>

            <div className="inputBx">
              <label htmlFor="tokenAddressoptionsDiv1">Token Address:</label>
              <div className="dropdown" id='dropdown1'>
                <input type="text" id="tokenAddressoptionsDiv1" className="textToken" placeholder="Enter token address"
                  readOnly></input>
                <div className="option" id='optionsDiv1'>
                </div>
              </div>
            </div>

            <div className="inputBx">
              <label htmlFor="amount">Amount:</label>
              <input type="text" id="amount" placeholder="Enter amount" />
              <button onClick={this.handleDepositClick} type='button'>Deposit</button>
            </div>

            <div className="inputBx">
              <label htmlFor="tokenAddressoptionsDiv2">Token Address:</label>
              <div className="dropdown" id='dropdown2'>
                <input type="text" id="tokenAddressoptionsDiv2" className="textToken" placeholder="Enter token address"
                  readOnly></input>
                <div className="option" id='optionsDiv2'>
                </div>
              </div>
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
            <div className="inputBx">
              <button onClick={this.handleExecuteDcaClick} type='button'>Execute DCA</button>
            </div>
          </form>
        </div>
        <div className="token persondata" id='tokenPersonData'>
          <label htmlFor="token">
            <p> No data loaded check</p>
            <br></br>
            <p> your blockchain connection</p>
          </label>
        </div>
        <div className="token dcaparams" id='tokenDcaParams'>
          <label htmlFor="token">
            <p> No data loaded check</p>
            <br></br>
            <p> your blockchain connection</p>
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