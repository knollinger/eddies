CREATE DATABASE EDDIES;
USE EDDIES;

/**
 * Enable die coolen group_by methoden aus SQL99
 */

SET  sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

/**
 * Die Mitglieder-Tabelle
 */
CREATE TABLE members (
    id             INT(10) AUTO_INCREMENT,
    role           INT(10) NOT null,
    zname          VARCHAR(30) NOT NULL, 
    vname          VARCHAR(30) NOT NULL, 
    vname2         VARCHAR(30), 
    title          VARCHAR(30), 
    phone          VARCHAR(20), 
    mobile         VARCHAR(20), 
    email          VARCHAR(512), 
    PRIMARY KEY(id)
);

CREATE TABLE user_accounts (
    id             INT(10) DEFAULT NOT NULL,
    accountName    VARCHAR(20) NOT NULL,
    pwdhash        CHAR(64) NOT NULL,
  	KEY id (id),
  	CONSTRAINT `user_accounts_ibfk_1` FOREIGN KEY (`id`) REFERENCES `members` (`id`)
)

CREATE TABLE attachments (
    id         int(10) NOT NULL AUTO_INCREMENT,
    domain     varchar(20) NOT NULL,
    ref_id     int(10) NOT NULL,
    timestamp  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    file_name  varchar(256) NOT NULL,
    file       mediumblob NOT NULL,
    mimetype   varchar(200) NOT NULL,
  PRIMARY KEY (id)
);

/**
 * Die einzelnen Termine
 */
CREATE TABLE cal_entries (
	id           INT(10) AUTO_INCREMENT,
	date         DATE NOT null,
	begin        TIME NOT null,
	end          TIME NOT null,
    PRIMARY 	 KEY(id)
)	

/**
 * 
 */
CREATE TABLE events (
	id           INT(10) AUTO_INCREMENT,
	ref_id       INT(10) NOT null,
	description  VARCHAR(512) NOT null,
    PRIMARY 	 KEY(id),
	FOREIGN KEY (ref_id) REFERENCES cal_entries(id)
)	
