// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount, uint256 timestamp);
    event Withdraw(uint256 amount, uint256 timestamp);
    event WithdrawAll(uint256 amount, uint256 timestamp);

    struct Transaction {
        string action;
        uint256 amount;
        uint256 timestamp;
    }

    Transaction[] public transactionHistory;

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");

        uint _previousBalance = balance;

        balance += _amount;

        assert(balance == _previousBalance + _amount);

        transactionHistory.push(Transaction("Deposit", _amount, block.timestamp));

        emit Deposit(_amount, block.timestamp);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");

        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        transactionHistory.push(Transaction("Withdraw", _withdrawAmount, block.timestamp));

        emit Withdraw(_withdrawAmount, block.timestamp);
    }

    function withdrawAll() public {
        require(msg.sender == owner, "You are not the owner of this account");

        uint _previousBalance = balance;
        uint _withdrawAmount = balance;

        balance = 0;

        assert(balance == 0);

        transactionHistory.push(Transaction("Withdraw All", _withdrawAmount, block.timestamp));

        emit WithdrawAll(_withdrawAmount, block.timestamp);
    }

    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactionHistory;
    }
}
