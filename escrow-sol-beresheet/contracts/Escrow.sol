// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

// makes new escrow contracts
contract Factory {
    address[] public allEscrowContracts;
    uint256 public escrowCount;

    constructor() {
        escrowCount = 0;
    }

    function createContract() public {
        address newContract = address(new Escrow(msg.sender, escrowCount++));
        allEscrowContracts.push(newContract);
    }

    function getAllContracts() public view returns (address[] memory) {
        return allEscrowContracts;
    }

    function getByID(uint256 queryID) public view returns (address) {
        return allEscrowContracts[queryID];
    }
}

contract Escrow {
    mapping(address => uint256) private balances;

    address public seller;
    address public buyer;
    address public escrowOwner;
    uint256 public blockNumber;
    uint256 public feePercent;
    uint256 public escrowID;
    uint256 public escrowCharge;

    bool public sellerApproval;
    bool public buyerApproval;

    bool public sellerCancel;
    bool public buyerCancel;

    uint256[] public deposits;
    uint256 public feeAmount;
    uint256 public sellerAmount;

    enum EscrowState {
        unInitialized,
        initialized,
        buyerDeposited,
        serviceApproved,
        escrowComplete,
        escrowCancelled
    }
    EscrowState public escrowState = EscrowState.unInitialized;

    event Deposit(address depositor, uint256 deposited);
    event ServicePayment(uint256 blockNo, uint256 contractBalance);

    constructor(address _escrowOwner, uint256 _escrowID) {
        escrowOwner = _escrowOwner;
        escrowID = _escrowID;
        escrowCharge = 0;
    }

    function initEscrow(
        address _seller,
        address _buyer,
        uint256 _feePercent,
        uint256 _blockNum
    ) public onlyEscrowOwner {
        require((_seller != msg.sender) && (_buyer != msg.sender));
        escrowID += 1;
        seller = _seller;
        buyer = _buyer;
        feePercent = _feePercent;
        blockNumber = _blockNum;
        escrowState = EscrowState.initialized;

        balances[seller] = 0;
        balances[buyer] = 0;
    }

    function depositToEscrow() public payable checkBlockNumber onlyBuyer {
        balances[buyer] = balances[buyer] + msg.value;
        deposits.push(msg.value);
        escrowCharge += msg.value;
        escrowState = EscrowState.buyerDeposited;
        emit Deposit(msg.sender, msg.value);
    }

    function approveEscrow() public {
        if (msg.sender == seller) {
            sellerApproval = true;
        } else if (msg.sender == buyer) {
            buyerApproval = true;
        }
        if (sellerApproval && buyerApproval) {
            escrowState = EscrowState.serviceApproved;
            fee();
            payOutFromEscrow();
            emit ServicePayment(block.number, address(this).balance);
        }
    }

    function cancelEscrow() public checkBlockNumber {
        if (msg.sender == seller) {
            sellerCancel = true;
        } else if (msg.sender == buyer) {
            buyerCancel = true;
        }
        if (sellerCancel && buyerCancel) {
            escrowState = EscrowState.escrowCancelled;
            refund();
        }
    }

    function endEscrow() public ifApprovedOrCancelled onlyEscrowOwner {
        killEscrow();
    }

    // private and internal
    // TODO add logic to decide wether to destroy or not boolean
    function killEscrow() internal {
        selfdestruct(payable(escrowOwner));
    }

    function payOutFromEscrow() private {
        balances[buyer] = balances[buyer] - address(this).balance;
        balances[seller] = balances[seller] + address(this).balance;
        escrowState = EscrowState.escrowComplete;
        sellerAmount = address(this).balance;
        payable(seller).transfer(address(this).balance);
    }

    function fee() private {
        uint256 totalFee = address(this).balance * (feePercent / 100);
        feeAmount = totalFee;
        payable(escrowOwner).transfer(totalFee);
    }

    function refund() private {
        payable(buyer).transfer(address(this).balance);
    }

    // Getter functions
    function getEscrowID() public view returns (uint256) {
        return escrowID;
    }

    function checkEscrowStatus() public view returns (EscrowState) {
        return escrowState;
    }

    function getEscrowContractAddress() public view returns (address) {
        return address(this);
    }

    function getAllDeposits() public view returns (uint256[] memory) {
        return deposits;
    }

    function hasBuyerApproved() public view returns (bool) {
        if (buyerApproval) {
            return true;
        } else {
            return false;
        }
    }

    function hasSellerApproved() public view returns (bool) {
        if (sellerApproval) {
            return true;
        } else {
            return false;
        }
    }

    function hasBuyerCancelled() public view returns (bool) {
        if (buyerCancel) {
            return true;
        }
        return false;
    }

    function hasSellerCancelled() public view returns (bool) {
        if (sellerCancel) {
            return true;
        }
        return false;
    }

    function getFeeAmount() public view returns (uint256) {
        return feeAmount;
    }

    function getSellerAmount() public view returns (uint256) {
        return sellerAmount;
    }

    function totalEscrowBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function hasEscrowExpired() public view returns (bool) {
        if (blockNumber > block.number) {
            return false;
        } else {
            return true;
        }
    }

    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }

    // modifiers
    modifier onlyBuyer() {
        require(msg.sender == buyer, "only buyer");
        _;
    }

    modifier onlyEscrowOwner() {
        require(msg.sender == escrowOwner, "only escrow owner");
        _;
    }

    modifier checkBlockNumber() {
        require(blockNumber > block.number, "escrow time has ended");
        _;
    }

    modifier ifApprovedOrCancelled() {
        require(
            (escrowState == EscrowState.serviceApproved) ||
                (escrowState == EscrowState.escrowCancelled),
            "not approved or cancelled"
        );
        _;
    }

    receive() external payable onlyBuyer {}

    fallback() external payable {
        revert();
    }
}
