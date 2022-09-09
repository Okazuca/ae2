/**
 * Static Cofiguration - Showdown Chatbot
 *
 * Copy this file into "config.js" and make the
 * configuration changes
 */

'use strict';

const Config = Object.create(null);
module.exports = Config;

/* Static admin account */

Config.Static_Admin_Account = "Dalirio";

Config.Static_Admin_Account_Password = "PIBSDNS06";

/**
 * Data Mode:
 * RAW - Data is stored as flat files
 * MYSQL - Data is stored in a remote MYSQL database
 */
Config.Data_Mode = "RAW";

/* MYSQL */

Config.MYSQL = Object.create(null);

Config.MYSQL.host = "dawn.psim.us";

Config.MYSQL.user = "Dalirio";

Config.MYSQL.password = "";

Config.MYSQL.database = "";
