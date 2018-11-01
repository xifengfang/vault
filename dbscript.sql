CREATE DATABASE Vault COLLATE utf8_general_ci;

USE Vault;


CREATE TABLE `Teller`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`FirstName` VARCHAR(50) NOT NULL,
	`LastName` VARCHAR(50) NOT NULL,
	`Email` VARCHAR(50) NOT NULL,
	`ApprovalAddress` VARCHAR(100) NULL,
	`DateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


CREATE TABLE `UserInfo`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`FirstName` VARCHAR(50) NULL,
	`LastName` VARCHAR(50) NULL,
	`Email` VARCHAR(50) NULL,
	`ApprovalAddress` VARCHAR(100) NULL,
	`InvitedBy` INT NULL,
	`Status` VARCHAR(50) NULL, /*invited/signup*/
	`OwnReferCode` VARCHAR(50) NULL,
	`SignupCodeUsed` VARCHAR(50) NULL,
	`DateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`LastLoginTicker` BIGINT NULL,
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


CREATE TABLE `WalletApprover`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`UserId` VARCHAR(50) NULL,
	`WalletId` VARCHAR(50) NULL,
	`DateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


CREATE TABLE `Wallet`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Wallet` VARCHAR(50) NULL,
	`WalletType` VARCHAR(50) NULL,
	`Status` VARCHAR(50) NULL,
	`DateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`Alias` VARCHAR(50) NULL,
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


CREATE TABLE `OAuthAccessToken`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`UserId` INT NOT NULL,
	`AccessToken` VARCHAR(80) NULL,
	`DateCreated` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`DateExpiration` DATETIME,
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


CREATE TABLE `SystemSetting`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Version` VARCHAR(50) NULL, /*beta*/
	`MasterReferCode` VARCHAR(200) NULL, /*AAAAA*/
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


CREATE TABLE `ERC20Token`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`TokenTicker` VARCHAR(50) NULL,	
	`TokenName` VARCHAR(50) NULL,
	`ContractAddr` VARCHAR(200) NULL,
	PRIMARY KEY (`Id`)
)
COLLATE = utf8_general_ci;


ALTER TABLE `UserInfo` ADD `InvitedBy` INT NULL;
ALTER TABLE `UserInfo` ADD `Status` VARCHAR(50) NULL;
ALTER TABLE `UserInfo` ADD `OwnReferCode` VARCHAR(50) NULL;
ALTER TABLE `UserInfo` ADD `LastLoginTicker` BIGINT NULL;
ALTER TABLE `UserInfo` ADD `SignupCodeUsed` VARCHAR(50) NULL;
INSERT INTO `SystemSetting` (`Version`,`MasterReferCode`) VALUES('beta','aaaaaaa')


ALTER TABLE `Wallet` ADD `Alias` VARCHAR(50) NULL;
INSERT INTO `ERC20Token`(`TokenTicker`,`TokenName`,`ContractAddr`) VALUES ('ETH', 'Ethereum', '0x0000000000000000000000000000000000000000');
