//VERSION: 1
/**
 * This script provides a framework for creating a basic Telegram bot using the
 * scriping functionalities of the Gen2 devices. It allows you to define custom commands,
 * validate parameters, and perform actions based on user messages.
 * The bot interacts with the Telegram API to receive and send messages.
 *
 * The script will take advantage of the KVS to store the messages offset value. The key
 * for it is the script's ident name from the configuration
 *
 * Please check TELEGRAM-BOT.md for instructions how to setup the telegram bot and
 * further instructions of how to configure the commands
 */


  
  let TelegramBot = {
    directMessage: function (textMsg) {
      if (CONFIG.debug) {
        console.log("SENDING", textMsg, CONFIG.chatID);
      }
  
      Shelly.call(
        "HTTP.GET",
        {
          url:
            CONFIG.baseUrl +
            "/sendMessage?chat_id=" +
            CONFIG.chatID +
            "&text=" +
            textMsg,
          timeout: 1,
        },
        function (d, r, m) {
          if (CONFIG.debug) {
            console.log("MSG SENT", JSON.stringify(d), r, m);
          }
        }
      );
    },
  };
  
  
  
  // Leginella optimizing
  // 
  //
  //
  let LegionellaTimer = {
    /**
     * Initializes the bot by emitting the specified event to start polling for updates.
     */
    initLeg: function () {
      this.startTimer();
        // temp check sheduling
      Timer.set(CONFIG.checkInterval, true, function () {
        console.log("Checking temp");
        LegionellaTimer.temperatureCheck();
      });
    },
    //functions that start timer
    startTimer: function () {
      alertTimer = Timer.set(
        CONFIG.timeoutBeforeAlert,
        true,
        function (ud) {
          LegionellaTimer.startLegionellen(ud);
        },
        null
      );
      TelegramBot.directMessage("Timer Start");
      if (CONFIG.debug) {
        console.log("Start Timer");
      }
    },
    // function that stop timer
    stopTimer: function () {
      Timer.clear(alertTimer);
      TelegramBot.directMessage("Timer Stop");
      if (CONFIG.debug) {
        console.log("Stop Timer");
      }
    },
  
    startLegionellen: function(ud) {
      TelegramBot.directMessage("Legionellen Schaltung aktiv");
      print("Legionellen Start");
  
  
    },
    //check if the temp of sensor is higher than
    temperatureCheck: function (ud) {
      Shelly.call(
        "temperature.getStatus",
        { id: 102 },
        function (response) {
          if (JSON.stringify(Math.round(response.tC)) > CONFIG.tempHigh) {
            alert("Temp higher than tempHigh");
            print(JSON.stringify(Math.round(response.tC)));
            TelegramBot.directMessage("Aktuelle Temperatur höher als Zielwert: "+JSON.stringify(Math.round(response.tC)));
            this.stopTimer();
            this.startTimer();
  
          };
          TelegramBot.directMessage("Aktuelle Temperatur: "+JSON.stringify(Math.round(response.tC)));
        },
        null
      );
    },
  
  
  }
  
  /**
   * initializes the bot and setting up event listeners.
   */
  function init() {
    LegionellaTimer.initLeg();
  }
  init();