import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Client, Intents } from "discord.js";
import { env, exit } from "process";

const commandName = "gbs";
const optionNameChoices = "choices";
const optionNameTitle = "title";
const registerCommands = async (
  clientId: string,
  token: string
): Promise<void> => {
  new REST({ version: "10" })
    .setToken(token)
    .put(Routes.applicationCommands(clientId), {
      body: [
        new SlashCommandBuilder()
          .setName(commandName)
          .setDescription("Take a survey with reactions(👍/🤔/👎)")
          .addStringOption(
            new SlashCommandStringOption()
              .setName(optionNameTitle)
              .setDescription("Title of this survey.")
              .setRequired(true)
          )
          .addStringOption(
            new SlashCommandStringOption()
              .setName(optionNameChoices)
              .setDescription("Choices splitted by comma(,).")
              .setRequired(true)
          )
          .toJSON(),
      ],
    });
};

const launchBot = async (token: string): Promise<void> =>
  new Promise((_, reject) => {
    const client = new Client({
      intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
      partials: ["CHANNEL"],
    });
    client.once("ready", () => console.log("Ready"));
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      if (interaction.commandName !== commandName) return;
      const choices = [
        ...new Set(
          interaction.options
            .getString(optionNameChoices, true)
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== "")
        ),
      ];
      const title = interaction.options.getString(optionNameTitle, true);
      await interaction.reply(title);
      await choices.reduce(
        (acc: Promise<unknown>, choice) =>
          acc.then(() =>
            interaction
              .channel!.send(choice)
              .then((message) => message.react("👍").then(() => message))
              .then((message) => message.react("🤔").then(() => message))
              .then((message) => message.react("👎"))
          ),
        Promise.resolve()
      );
    });
    client.once("error", reject);

    client.login(token);
  });

const main = async () => {
  const clientId = env.CLIENT_ID;
  if (!clientId) throw new Error("Invalid discord token");
  const token = env.DISCORD_TOKEN;
  if (!token) throw new Error("Invalid discord token");

  await registerCommands(clientId, token);
  await launchBot(token);
};

main()
  .then(() => exit(0))
  .catch((e) => {
    console.error(e);
    exit(0);
  });
