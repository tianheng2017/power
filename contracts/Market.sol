// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Market {
    // 账号集合映射（private不公开）
    // 账号地址 => 以太坊余额 + (代币地址 => 代币余额)
    mapping(address => Account) private accounts;

    // 卖单集合映射
    mapping(uint256 => Offer) public offers;
    // 全局卖单号
    uint256 public lastOfferNumber;
    // 卖单数量
    uint256 public offersCount;

    // 买单集合映射
    mapping(uint256 => Bid) public bids;
    // 全局买单号
    uint256 public lastBidNumber;
    // 买单数量
    uint256 public bidsCount;

    // 合约所有者
    address public owner;

    // 账号结构体
    struct Account {
        // 托管ETH余额
        uint256 balance;
        // 托管代币余额
        mapping(address => uint256) tokenBalances;
    }
    // 买单结构体
    struct Bid {
        // 代币合约
        address tokenAddress;
        // 买价
        uint256 price;
        // 数量
        uint256 quantity;
        // 买单号
        uint256 bidNumber;
        // 买家地址
        address buyer;
        // 是否已成交
        bool matched;
    }
    // 卖单结构体
    struct Offer {
        // 代币合约
        address tokenAddress;
        // 卖价
        uint256 price;
        // 数量
        uint256 quantity;
        // 卖单号
        uint256 offerNumber;
        // 卖家地址
        address seller;
        // 是否已成交
        bool matched;
    }
    // 修饰器，只有合约所有者才能调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    // 合约初始化
    constructor() {
        // 设置合约所有者
        owner = msg.sender;
    }

    // 存取款事件
    event Deposit(address indexed tokenAddress, address indexed account, uint256 amount);
    event Withdraw(address indexed tokenAddress, address indexed account, uint256 amount);
    // 卖家事件
    event OfferAdded(address indexed tokenAddress, uint256 indexed offerNumber, uint256 price, uint256 quantity, address indexed account);
    event OfferChanged(uint256 indexed offerNumber, uint256 price, address indexed account);
    event OfferRemoved(uint256 indexed offerNumber, address indexed account);
    // 成交事件
    event Trade(address tokenAddress, uint256 offerNumber, uint256 bidNumber, uint256 price, uint256 indexed quantity, address indexed seller, address indexed buyer);
    
    // 获取账户托管ETH余额
    function getAccountBalance() public view returns (uint256) {
        return accounts[msg.sender].balance;
    }

    // 获取账户托管代币余额
    function getAccountTokenBalance(address tokenAddress) public view returns (uint256) {
        return accounts[msg.sender].tokenBalances[tokenAddress];
    }

    // 获取卖单详情
    function getOffer(uint256 offerNumber) public view returns (Offer memory) {
        // 校验卖单号
        require(offers[offerNumber].offerNumber != 0, "Offer not fund");
        // 返回卖单信息
        return offers[offerNumber];
    }

    // 获取买单详情
    function getBid(uint256 bidNumber) public view returns (Bid memory) {
        // 校验买单号
        require(bids[bidNumber].bidNumber != 0, "Bid not fund");
        // 返回买单信息
        return bids[bidNumber];
    }

    // 获取卖单列表
    function getOffersList() public view returns (Offer[] memory) {
        Offer[] memory offersList = new Offer[](offersCount);
        uint i = 0;
        for (uint id = 1; id <= offersCount; id++) {
            Offer storage offer = offers[id];
            if (offer.matched == false) {
                offersList[i] = offer;
                i++;
            }
        }
        return offersList;
    }

    // 获取买单列表
    function getBidsList() public view returns (Bid[] memory) {
        Bid[] memory bidsList = new Bid[](bidsCount);
        uint i = 0;
        for (uint id = 1; id <= bidsCount; id++) {
            Bid storage bid = bids[id];
            if (bid.matched == false) {
                bidsList[i] = bid;
                i++;
            }
        }
        return bidsList;
    }

    // ETH存款
    function depositETH() public payable {
        // 检查存款金额必须大于0
        require(msg.value > 0, "Amount must be greater than 0");
        // 托管ETH余额增加
        accounts[msg.sender].balance += msg.value;
        // 发出ETH存款事件
        emit Deposit(address(0), msg.sender, msg.value);
    }

    // ETH提款
    function withdrawETH(uint256 amount) public {
        // 检查提款金额必须大于0
        require(amount > 0, "Amount must be greater than 0");
        // 检查托管ETH余额必须 >= 提款金额
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        // 托管ETH余额扣除
        accounts[msg.sender].balance -= amount;
        // 用户钱包余额增加
        payable(msg.sender).transfer(amount);
        // 发出ETH提款事件
        emit Withdraw(address(0), msg.sender, amount);
    }

    // token存款
    function depositToken(address tokenAddress, uint256 amount) public {
        // 确保是有效地址
        require(tokenAddress != address(0) && tokenAddress != address(this), "Invalid Token Address");
        // 检查存款金额
        require(amount > 0, "Amount must be greater than 0");
        // 划转token到合约
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        // 账户token余额增加
        accounts[msg.sender].tokenBalances[tokenAddress] += amount;
        // 发出代币存款事件
        emit Deposit(tokenAddress, msg.sender, amount);
    }

    // token提款
    function withdrawToken(address tokenAddress, uint256 amount) public {
        // 传引用
        Account storage account = accounts[msg.sender];
        // 确保是有效地址
        require(tokenAddress != address(0) && tokenAddress != address(this), "Invalid Token Address");
        // 检查提款金额必须大于0
        require(amount > 0, "Amount must be greater than 0");
        // 检查账户余额必须 >= 提款金额
        require(account.tokenBalances[tokenAddress] >= amount, "Insufficient token balance");
        // 账户扣款
        account.tokenBalances[tokenAddress] -= amount;
        // 用户钱包代币增加
        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer failed");
        // 发出提款事件
        emit Withdraw(tokenAddress, msg.sender, amount);
    }

    // 创建卖单
    // 参数：代币地址，卖出价格、卖出数量
    function addOffer(address tokenAddress, uint256 price, uint256 quantity) public {
        // 确保是有效地址
        require(tokenAddress != address(0) && tokenAddress != address(this), "Invalid Token Address");
        // 卖出价格必须大于0
        require(price > 0, "Price must be greater than 0");
        // 卖出数量必须大于0
        require(quantity > 0, "Quantity must be greater than 0");
        // 全局卖单号递增
        lastOfferNumber++;
        // 卖单数量递增
        offersCount++;
        // 创建卖单
        offers[lastOfferNumber] = Offer(tokenAddress, price, quantity, lastOfferNumber, msg.sender, false);
        // 发出卖单事件
        emit OfferAdded(tokenAddress, lastOfferNumber, price, quantity, msg.sender);
    }

    // 修改卖单
    // 参数：卖单号，卖出价格
    function changeOffer(uint256 offerNumber, uint256 price) public {
        // 鉴权，只有卖单创建者才能修改
        require(offers[offerNumber].seller == msg.sender, "Only the offer creator can change the offer");
        // 卖出价格必须大于0
        require(price > 0, "Price must be greater than 0");
        // 卖家只能降低价格，不能提高价格
        require(offers[offerNumber].price > price, "Price can only be decreased");
        // 更新卖出价格
        offers[offerNumber].price = price;
        // 发出卖单修改事件
        emit OfferChanged(offerNumber, price, msg.sender);
    }

    // 移除卖单
    function removeOffer(uint256 offerNumber) public {
        // 鉴权，只有卖单创建者才能删除
        require(offers[offerNumber].seller == msg.sender, "Only the offer creator can remove the offer");
        // 删除卖单
        delete offers[offerNumber];
        // 卖单数量减少
        offersCount--;
        //  发出卖单删除事件
        emit OfferRemoved(offerNumber, msg.sender);
    }

    // 提交买单
    // 参数：代币地址，买入价格、买入数量
    function addBid(address tokenAddress, uint256 price, uint256 quantity) public returns (uint256) {
        // 确保是代币地址是有效地址
        require(tokenAddress != address(0) && tokenAddress != address(this), "Invalid Token Address");
        // 买入价格必须大于0
        require(price > 0, "Price must be greater than 0");
        // 买入数量必须大于0
        require(quantity > 0, "Quantity must be greater than 0");
        // 全局买单号递增
        lastBidNumber++;
        // 买单数量递增
        bidsCount++;
        // 创建买单
        bids[lastBidNumber] = Bid(tokenAddress, price, quantity, lastBidNumber, msg.sender, false);
        // 返回买单买单号
        return lastBidNumber;
    }
    
    // 移除买单
    // 参数：买单号
    function removeBid(uint256 bidNumber) public {
        // 校验买单号
        require(bids[bidNumber].bidNumber != 0, "Bid not fund");
        // 鉴权，只有买家自己才能操作
        require(bids[bidNumber].buyer == msg.sender, "Only the bid creator can remove the bid");
        // 删除买单
        delete bids[bidNumber];
        // 总买单数量减少
        bidsCount--;
    }
    
    // 撮合订单
    // 用买单依次去匹配所有卖单，直到买单完全成交
    function orderMaching() public {
        // 遍历所有买单，订单号从1开始递增，代表优先处理等待时间最长的
        for (uint256 i = 1; i <= lastBidNumber; i++) {
            // 跳过已经完全成交的买单
            if (bids[i].matched == true) continue;

            // 遍历卖单
            for (uint256 j = 0; j < lastOfferNumber; j++) {

                // 如果匹配过程中，买单最后已经完全成交，就不再继续匹配其他卖单了
                if (bids[i].matched == true) break;

                // 如果买卖单都未成交
                // 且买卖双方代币类型也相同
                // 且卖单价格 <= 买单价格，且卖单数量 > 0，且买单数量 > 0
                if (
                    bids[i].matched == false &&
                    offers[j].matched == false && 
                    offers[j].tokenAddress == bids[i].tokenAddress && 
                    offers[j].price <= bids[i].price && 
                    offers[j].quantity > 0 && bids[i].quantity > 0
                ) {
                    // 交易数量 = 卖单数量 < 买单数量 ? 卖单数量 : 买单数量
                    uint256 quantity = offers[j].quantity < bids[i].quantity ? offers[j].quantity : bids[i].quantity;

                    // 交易金额 = 交易数量 * 卖单价格
                    // 在价格为p的卖出报价与价格为 q ≥ p 的买入订单匹配时，买家始终是支付更低的价格p
                    uint256 cost = quantity * offers[j].price / 10 ** 18;

                    // 禁止账户余额为负数，如果执行匹配时会让买家或卖家的余额产生负数，则不执行该匹配
                    // 如果卖家代币不足，则跳过这个卖单，继续匹配下一个
                    if (accounts[offers[j].seller].tokenBalances[offers[j].tokenAddress] < quantity) continue;
                    // 如果买家ETH不足，则跳出，直接匹配下一个买单
                    if (accounts[bids[i].buyer].balance < cost) break;

                    // 卖家获得ETH
                    accounts[offers[j].seller].balance += cost;
                    // 卖家扣除代币
                    accounts[offers[j].seller].tokenBalances[offers[j].tokenAddress] -= quantity;
                    // 卖单数量减少
                    offers[j].quantity -= quantity;
                    // 如果卖单数量减少为0，则卖单标记为已成交
                    if (offers[j].quantity == 0) {
                        // 标记为已成交
                        offers[j].matched = true;
                        // 总卖单数量减少
                        offersCount--;
                    }

                    // 买家A扣除ETH
                    accounts[bids[i].buyer].balance -= cost;
                    // 买家A获得代币
                    accounts[bids[i].buyer].tokenBalances[bids[i].tokenAddress] += quantity;
                    // 买单数量减少
                    bids[i].quantity -= quantity;
                    // 如果买单数量减少为0，则买单标记为已成交
                    if (bids[i].quantity == 0) {
                        // 买单标记为已成交
                        bids[i].matched = true;
                        // 总买单数量减少
                        bidsCount--;
                    }

                    // 发出成交事件
                    // 公开卖单号、买单号、价格、数量、卖家、买家
                    emit Trade(offers[j].tokenAddress, offers[j].offerNumber, bids[i].bidNumber, offers[j].price, quantity, offers[j].seller, bids[i].buyer);
                }
            }
        }
    }
}