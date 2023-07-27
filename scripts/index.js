import { world, system, Player } from "@minecraft/server";

function getRanks(player) {
  let rank_prefix = "rank:";
  let default_rank = "§6Member§r";
  const ranks = player
    .getTags()
    .map((tags) => {
      if (!tags.startsWith(rank_prefix)) return null;
      return tags
        .substring(rank_prefix.length)
        .replace("§k", "")
    })
    .filter((tag) => tag);
  return ranks.length == 0 ? [default_rank] : ranks;
}

const chats = new Map();

function getPlayerChatsPerSecond(player) {
  const currentTime = Date.now();
  const playerChats = chats.get(player) || [];
  const recentChats = playerChats.filter(({ timestamp }) => currentTime - 4000 < timestamp);
  chats.set(player, recentChats);
  return recentChats.length;
}

world.beforeEvents.chatSend.subscribe((data) => {
  const chatInfo = { timestamp: Date.now() };
  const playerChats = chats.get(data.sender) || [];
  playerChats.push(chatInfo);
  chats.set(data.sender, playerChats);
});

world.beforeEvents.chatSend.subscribe((data) => {
  const player = data.sender;
  const message = data.message;
  const msgCount = getPlayerChatsPerSecond(player);
  data.cancel = true;
  if (msgCount >= 4) return player.sendMessage("§dSystem §f>> §cYou are sending messages too fast!");
  if (!message.startsWith("!")) {
    world.sendMessage(`§7[§r${getRanks(player).join("§8, ")}§r§7] §r§e${player.name}: §f${message}`);
  }
  player.runCommandAsync(`tellraw @a[tag=bot] {"rawtext":[{"text":"${player.name} |_-/\-_-/\-_| ${message}"}]}`);
})
