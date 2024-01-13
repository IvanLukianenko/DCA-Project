// Function to handle deposit
window.deposit = async () => {
    const amount = document.getElementById('amount').value;
    const accounts = await web3.eth.getAccounts();

    try {
        // Call the deposit function on the smart contract
        await dcaContract.methods.deposit().send({ from: accounts[0], value: web3.utils.toWei(amount, 'ether') });
        alert('Deposit successful!');
    } catch (error) {
        console.error('Error depositing funds:', error);
        alert('Error depositing funds. Please check the console for details.');
    }
};

// Function to handle setting DCA parameters
window.setDcaParams = async () => {
    const ethAmount = document.getElementById('ethAmount').value;
    const interval = document.getElementById('interval').value;
    const accounts = await web3.eth.getAccounts();

    try {
        // Call the setDCAParameters function on the smart contract
        await dcaContract.methods.setDCAParameters(web3.utils.toWei(ethAmount, 'ether'), interval).send({ from: accounts[0] });
        alert('DCA parameters set successfully!');
    } catch (error) {
        console.error('Error setting DCA parameters:', error);
        alert('Error setting DCA parameters. Please check the console for details.');
    }
};

// Function to handle executing DCA
window.executeDca = async () => {
    const accounts = await web3.eth.getAccounts();

    try {
        // Call the executeDCA function on the smart contract
        await dcaContract.methods.executeDCA().send({ from: accounts[0] });
        alert('DCA executed successfully!');
    } catch (error) {
        console.error('Error executing DCA:', error);
        alert('Error executing DCA. Please check the console for details.');
    }
};