import './App.css';
import React, { useEffect, Component } from 'react';
import dcaABI from './ContractAbi';
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
    const ethAmount = document.getElementById('ethAmount').value;
    const interval = document.getElementById('interval').value;
    const accounts = await this.web3.eth.getAccounts();

    try {
      // Call the setDCAParameters function on the smart contract
      await this.dcaContract.methods.setDCAParameters(this.web3.utils.toWei(ethAmount, 'ether'), interval).send({ from: accounts[0] });
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

  async componentDidMount() {
    // Asynchronously initialize DcaApp
    await this.dcaApp.init();
    this.setState({ isInitialized: true });
  };

  handleDepositClick = async () => {
    // Check if initialization is complete before calling deposit
    if (this.state.isInitialized) {
      await this.dcaApp.deposit();
    } else {
      alert('DCA App is still initializing. Please wait.');
    }
  };

  render() {
    return (
      <section>
        <div className="box">
          <div className="form">
            <h2>DCA Smart Contract Interaction</h2>
            <form>
              <div className="inputBx">
                <label htmlFor="amount">Amount:</label>
                <input type="text" id="amount" placeholder="Enter amount" />
                <button onClick={this.dcaApp.deposit}>Deposit</button>
              </div>
              <div className="inputBx">
                <label htmlFor="ethAmount">ETH Amount:</label>
                <input
                  type="text"
                  id="ethAmount"
                  placeholder="Enter ETH amount"
                />
                <button onClick={this.dcaApp.setDcaParams}>
                  Set DCA Parameters
                </button>
              </div>
              <div className="inputBx">
                <label htmlFor="interval">Interval (seconds):</label>
                <input type="text" id="interval" placeholder="Enter interval" />
                <button onClick={this.dcaApp.executeDca}>Execute DCA</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }
}


export default UI;
