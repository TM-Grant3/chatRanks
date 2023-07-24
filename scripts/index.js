import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

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

world.beforeEvents.chatSend.subscribe((data) => {
  const player = data.sender;
  const message = data.message;
  data.cancel = true;
  if (!message.startsWith("!")) {
    world.sendMessage(`§7[§r${getRanks(player).join("§8, ")}§r§7], §r§e${player.name}: §f${message}`);
  }
  player.runCommandAsync(`tellraw @a[tag=bot] {"rawtext":[{"text":"${player.name} |_-/\-_-/\-_| ${message}"}]}`);
})
