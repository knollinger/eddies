CREATE TABLE IF NOT EXISTS `EDDIES`.`accounts` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `zname` VARCHAR(30) NOT NULL,
  `vname` VARCHAR(30) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `email` VARCHAR(512) NOT NULL,
  `photo` MEDIUMBLOB NULL DEFAULT NULL,
  `pwdhash` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NOT EXISTS `EDDIES`.`cal_entries` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `begin` TIME NOT NULL,
  `end` TIME NOT NULL,
  PRIMARY KEY (`id`));