import mineflayer from "mineflayer";
import config from "./config.json" assert { type: "json" };
import { loader as autoEat } from "mineflayer-auto-eat";
import pkg from "mineflayer-pathfinder";
import schedule from "node-schedule";
const { pathfinder, Movements, goals } = pkg;
const bots = [];
function createAndConnectBot(account, password) {
  console.log(config["messages"]["CREATE_BOT"]);
  // Tạo bot
  const bot = mineflayer.createBot({
    username: account,
    password: password,
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version,
    hideErrors: true,
  });
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(autoEat);
  //=========================================[Bot Event]========================================
  bot.once("spawn", async () => {
    try {
      // Cài đặt chế độ tự động ăn
      bot.autoEat.setOpts(config["opts-eat"]);
      bot.autoEat.enableAuto();
      // Kết nối thành công
      console.log(config["messages"]["IN_HUB"]);
      // Tải chunk
      bot.waitForChunksToLoad();
      console.log(config["messages"]["LOADED_CHUNKS"]);
      // Đăng nhập
      await sendLogin(password).then((message) => console.log(message));
      // Vào Skyblock
      await joinSkyblock().then((message) => console.log(message));
      // Kết nối thành công
      console.log(config["messages"]["IN_SKYBLOCK"]);
      // Tải chunk
      bot.waitForChunksToLoad();
      console.log(config["messages"]["LOADED_CHUNKS"]);
      // Đi đến warp AFK
      await warpAFK().then((message) => console.log(message));
      // Di chuyển xuống hồ AFK
      bot.setControlState('forward', true);
      setTimeout(() => {
        bot.setControlState('forward', false);
        console.log(config["messages"]["AFK_START"]);
      }, getRandom(3000, 5000));
    } catch (err) {
      console.error(`${config["tags-message"]["ERR"]}${err}`);
    }
  });
  //===========================[Bot Functions]===========================
  // Function đăng nhập
  function sendLogin(password) {
    return new Promise((resolve) => {
      console.log(config["messages"]["LOGIN_COMMAND"]);
      bot.chat(`/login ${password}`);
      resolve(config["messages"]["LOGIN_SUCC"]);
    });
  }
  // Function vào Skyblock
  function joinSkyblock() {
    return new Promise((resolve) => {
      // Mở bảng server
      console.log(config["messages"]["OPEN_SERVERS_LIST"]);
      setTimeout(() => {
        bot.setQuickBarSlot(0);
        bot.activateItem();
        console.log(config["messages"]["OPEN_SERVERS_LIST_SUCC"]);
        // Mở của sổ tìm kiếm lava bucket
        bot.once("windowOpen", async (window) => {
          console.log(config["messages"]["FINDING_SKYBLOCK_SERVER"]);
          const lavaBucket = window.slots.find(
            (item) => item && item.name === "lava_bucket"
          );
          if (lavaBucket) {
            console.log(config["messages"]["SKYBLOCK_SERVER_FOUND"]);
            // Click lava bucket
            await clickSlotWithRetry(bot, lavaBucket.slot, window);
            resolve(config["messages"]["CLICK_SUCC"]);
          } else {
            console.log(config["messages"]["SKYBLOCK_SERVER_NOT_FOUND"]);
            console.log(config["messages"]["RETRY_1S"]);
            setTimeout(() => {
              joinSkyblock();
            }, 1000);
          }
          // Đóng cửa sổ tìm kiếm
          setTimeout(() => bot.closeWindow(window), 1000);
        });
      }, 5000);
    });
  }
  // Function di chuyển đến warp AFK
  function warpAFK() {
    return new Promise((resolve) => {
      // Mở bảng warps
      console.log(config["messages"]["WARP_COMMAND"]);
      setTimeout(() => {
        bot.chat(`/warp`);
        // Mở của sổ tìm kiếm experience bottle
        bot.once("windowOpen", async (window) => {
          console.log(config["messages"]["FINDING_WARP_AFK"]);
          const expBottle = window.slots.find(
            (item) => item && item.name === "experience_bottle"
          );
          if (expBottle) {
            console.log(config["messages"]["WARP_AFK_FOUND"]);
            // Click experience bottle
            await clickSlotWithRetry(bot, expBottle.slot, window);
            resolve(config["messages"]["CLICK_SUCC"]);
          } else {
            console.log(config["messages"]["WARP_AFK_NOT_FOUND"]);
            console.log(config["messages"]["RETRY_1S"]);
            setTimeout(() => {
              warpAFK();
            }, 1000);
          }
          // Đóng cửa sổ tìm kiếm
          setTimeout(() => bot.closeWindow(window), 1000);
        });
      }, 5000);
    });
  }
  // Function di chuyển đến x y z
  function moveBotTo(x, y, z) {
    if (config["position"]["enabled"]) {
      return new Promise((resolve, reject) => {
        console.log(
          `${config["messages"]["MOVING_TO_POSITION"]}x: ${config["position"]["x"]}, y: ${config["position"]["y"]}, z: ${config["position"]["z"]}`
        );
        const defaultMove = new Movements(bot, bot.mcData);
        bot.pathfinder.setMovements(defaultMove);
        const goal = new goals.GoalBlock(x, y, z);
        bot.pathfinder.setGoal(goal);

        bot.on("goal_reached", () => {
          resolve(config["messages"]["MOVED_TO_POSITION_SUCC"]);
        });
        bot.once("goal_failed", (err) => {
          reject(err);
        });
      });
    } else {
      console.log(config["messages"]["POSITION_DISABLED"]);
    }
  }
  function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // Function clickSlotWithRetry
  async function clickSlotWithRetry(bot, slot, window) {
    try {
      await bot.clickWindow(slot, 0, 0);
    } catch (err) {
      console.log(config["messages"]["CLICK_ERR"]);
      console.log(config["messages"]["RETRY_1S"]);
      setTimeout(() => clickSlotWithRetry(bot, slot, window), 1000);
    }
  }
  function findingcoordinationTarget(not, entity, window){
    try{
      
    }catch(err){
      console.log("Unable to find exact coordinate!");
    }
    return null;
  }
  //===========================[Các loại tình huống]===========================
  // Chết
  bot.on("death", () => {
    console.log(config["messages"]["BOT_DEATH"]);
    bot.once("spawn", async () => {
      try {
        console.log(config["messages"]["BOT_REVIVE"]);
        // Tải chunk
        bot.waitForChunksToLoad();
        console.log(config["messages"]["LOADED_CHUNKS"]);
        // Đi đến warp AFK
        await warpAFK();
        // Di chuyển xuống hồ AFK
        await moveBotTo(
          config["position"]["x"],
          config["position"]["y"],
          config["position"]["z"]
        ).then((message) => console.log(message));
      } catch (err) {
        console.log(`${config["tags-messages"]["ERR"]}${err}`);
      }
    });
  });
  // Lỗi
  bot.on("error", (err) => {
    console.log(`${config["tags-messages"]["ERR"]}${err}`);
  });
  // Kicked
  bot.on("kicked", (reason) =>
    console.log(`${config["tags-messages"]["DISCN"]}${reason.message}`)
  );
  // Disconnect
  bot.on("end", () => {
    console.log(config["messages"]["BOT_DISCONNECT"]);
    console.log(config["messages"]["RETRY_5S"]);
    setTimeout(createAndConnectBot, 5000);
  });
  return bot;
}
//========================================[Main]========================================
bots[1] = createAndConnectBot(
  config["bot-account"]["username-1"],
  config["bot-account"]["password-1"]
);
// bots[2] = createAndConnectBot(config["bot-account"]["username-2"], config["bot-account"]["password-2"]);
// bots[3] = createAndConnectBot(config["bot-account"]["username-3"], config["bot-account"]["password-3"]);
const BotStart = schedule.scheduleJob("5 4 * * *", () => {
  console.log("[4:05 AM] Starting bot...");
  bots[1] = createAndConnectBot(
    config["bot-account"]["username-1"],
    config["bot-account"]["password-1"]
  );
});

// Dừng bot vào lúc 3:58 sáng
const BotStop = schedule.scheduleJob("58 3 * * *", () => {
  console.log("[3:58 AM] Stopping bot...");
  bots.forEach((bot, index) => {
    setTimeout(() => {
      if (bot) {
        console.log(`Stopping bot${index}...`);
        bot.quit();
      }
    }, index * 10000); // Thoát từng bot một, cách nhau 10 giây
  });
});
//========================================[End]========================================
