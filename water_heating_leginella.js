//VERSION: 
/**
* This script forms a simple logic for the prevention of legionella 
* in heating water tanks by means of a heating rod control. 
* The controller assumes that if PV surplus is present, 
* the water temperature is heated above a threshold value by another controller 
* and therefore the next legionella switching can take place later.
* Notifications will be sent over Telegram
 */
let CONFIG = {
  // the bot api key taken from the Telegram BotFather
  baseUrl:
    "https://api.telegram.org/bot64XXXXXX33:AAH24shXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  chatID: "519xxxxxx", // the chat ID for the bot
  timeoutBeforeAlert: 24 * 60 * 60 * 1000, // once in a week 7*24*60*60*1000
  checkInterval: 60 * 60 * 1000, // interval to check for conditions
  tempHigh: 54, // temp to reach to reset timer
  debug: false, // if set to true, the script will print debug messages in the console
};
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
    acttimeoutBeforeAlert = CONFIG.timeoutBeforeAlert;
    // if last timer run is older than timeoutBeforeAlert
    if (Date.now() - getLastTimerRun() > CONFIG.timeoutBeforeAlert || getLastTimerRun() == 0) {
      acttimeoutBeforeAlert = CONFIG.timeoutBeforeAlert;
    // if last timer run is younger than timeoutBeforeAlert
    } else {
      acttimeoutBeforeAlert = Date.now() - getLastTimerRun();
    }
    
    alertTimer = Timer.set(
      acttimeoutBeforeAlert,
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
    saveLastTimerRun(Date.now());
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
          if (CONFIG.debug) {
            console.log("Temp higher than tempHigh");
            console.log(JSON.stringify(Math.round(response.tC)));
          }
          TelegramBot.directMessage("Aktuelle Temperatur höher als Zielwert: "+JSON.stringify(Math.round(response.tC)));
          this.stopTimer();
          this.startTimer();

        }else{
          TelegramBot.directMessage("Aktuelle Temperatur: "+JSON.stringify(Math.round(response.tC)));
        }
      },
      null
    );
  },


}

function getLastTimerRun ( ) {
  Shelly.call(
    "KVS.Get",
    { key: "getLastTimerRun" },
    function (data, error) {
      let value = 0;
      if (error !== 0) {
        console.log(
          "Cannot read the value for the provided key, reason, using default value. getLastTimerRun" 
        );
      } else {
        if (CONFIG.debug) {
          console.log(data.value);
        }
        return data.value; 
      }
    }
  );

}
function saveLastTimerRun (value) {
    Shelly.call(
      "KVS.Set",
      { "key": "getLastTimerRun", "value": value }
  );
}
/**
 * initializes the bot and setting up event listeners.
 */
function init() {
  LegionellaTimer.initLeg();
}
init();