import { world, system } from "@minecraft/server";

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

function getScore(target, objective, useZero = true) {
    try {
        const oB = world.scoreboard.getObjective(objective);
        if (typeof target == "string") return oB.getScore(oB.getParticipants().find((pT) => pT.displayName == target));
        return oB.getScore(target.scoreboardIdentity);
    } catch {
        return useZero ? 0: NaN;
    }
}

world.beforeEvents.chatSend.subscribe((data) => {
  const player = data.sender;
  const message = data.message;
  const msgCount = getScore(player, "msgCount");
  if (msgCount >= 3) return player.sendMessage("§dSystem §f>> §cYou are sending messages too fast!");
  if (!message.startsWith("!")) {
    world.sendMessage(`§7[§r${getRanks(player).join("§8, ")}§r§7], §r§e${player.name}: §f${message}`);
  }
  player.runCommandAsync(`tellraw @a[tag=bot] {"rawtext":[{"text":"${player.name} |_-/\-_-/\-_| ${message}"}]}`);
  player.runCommandAsync("scoreboard players add @s msgCount 1");
  data.cancel = true;
})

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    player.runCommandAsync("scoreboard players set @s msgCount 0");
  }
}, 80);
