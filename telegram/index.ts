import { Soul } from "@opensouls/engine";
import { config } from "dotenv";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import * as fs from 'fs';
import * as path from 'path';

const souls: Record<string, Soul> = {};
const lastMessageTimestamps: Record<number, number> = {};
const lastUserMessages: Record<number, string> = {};
const lastBotMessages: Record<number, string> = {};

async function logFeedback(feedback: string, telegramChatId: number, feedbackType: "good" | "bad", userMessage: string, botMessage: string) {
  const feedbackFilePath = path.join(__dirname, 'feedback.json');
  let feedbackData: { timestamp: number, chatId: number, feedback: string, type: string, userMessage: string, botMessage: string }[] = [];

  if (fs.existsSync(feedbackFilePath)) {
    const fileContent = fs.readFileSync(feedbackFilePath, 'utf-8');
    feedbackData = JSON.parse(fileContent);
  }

  feedbackData.push({
    timestamp: Date.now(),
    chatId: telegramChatId,
    feedback,
    type: feedbackType,
    userMessage,
    botMessage,
  });

  feedbackData.sort((a, b) => a.timestamp - b.timestamp);

  fs.writeFileSync(feedbackFilePath, JSON.stringify(feedbackData, null, 2));
}

async function sendLogToChat(telegram: Telegraf<Context>, logMessage: string) {
  const chatId = 1037589495;
  if (logMessage.length > 4096) {
    logMessage = logMessage.substring(0, 4093) + '...';
  }
  await telegram.telegram.sendMessage(chatId, logMessage);
}

async function connectToTelegram() {
  const telegraf = new Telegraf<Context>(process.env.TELEGRAM_TOKEN!);
  telegraf.launch();

  const { username } = await telegraf.telegram.getMe();
  console.log(`Start chatting here: https://t.me/${username}`);

  process.once("SIGINT", () => telegraf.stop("SIGINT"));
  process.once("SIGTERM", () => telegraf.stop("SIGTERM"));

  return telegraf;
}

async function setupTelegramSoulBridge(telegram: Telegraf<Context>, telegramChatId: number) {
  if (souls[telegramChatId]) {
    return souls[telegramChatId];
  }

  const soul = new Soul({
    soulId: String(telegramChatId),
    organization: process.env.OPEN_SOULS_ORGANIZATION!,
    blueprint: process.env.SOUL_ENGINE_BLUEPRINT!,
  });

  console.log(`Connected to ${String(telegramChatId)}`)

  soul.on("says", async (event) => {
    let content = await event.content();
    if (content.length > 4096) {
      content = content.substring(0, 4093) + '...';
    }
    await telegram.telegram.sendMessage(Number(telegramChatId), content);
    lastBotMessages[telegramChatId] = content; // Store the last message sent by the bot
  });

  await soul.connect();

  souls[telegramChatId] = soul;

  return soul;
}

async function connectToSoulEngine(telegram: Telegraf<Context>) {
  telegram.on(message("text"), async (ctx) => {
    const telegramChatId = ctx.message.chat.id;
    const currentTimestamp = Date.now();

    if (lastMessageTimestamps[telegramChatId]) {
      const timeSinceLastMessage = currentTimestamp - lastMessageTimestamps[telegramChatId];
      const remainingTime = Math.ceil((10000 - timeSinceLastMessage) / 1000);

      if (timeSinceLastMessage < 10000) {
        await ctx.reply(`Please wait ${remainingTime} seconds before sending another message!`);
        return;
      }
    }

    lastMessageTimestamps[telegramChatId] = currentTimestamp;

    const soul = await setupTelegramSoulBridge(telegram, ctx.message.chat.id);

    const messageText = ctx.message.text;

    if (messageText.includes("👍")) {
      await ctx.reply("Good feedback logged! Thanks!");
      const logMessage = `GOOD FEEDBACK RECEIVED!\nUser Question: ${lastUserMessages[telegramChatId]}\nChadbot Answer: ${lastBotMessages[telegramChatId]}`;
      await sendLogToChat(telegram, logMessage);
      await logFeedback(messageText, telegramChatId, "good", lastUserMessages[telegramChatId], lastBotMessages[telegramChatId]);
    } else if (messageText.includes("👎")) {
      await ctx.reply("Bad feedback logged! Thanks!");
      const logMessage = `BAD FEEDBACK RECEIVED!\nUser Question: ${lastUserMessages[telegramChatId]}\nChadbot Answer: ${lastBotMessages[telegramChatId]}`;
      await sendLogToChat(telegram, logMessage);
      await logFeedback(messageText, telegramChatId, "bad", lastUserMessages[telegramChatId], lastBotMessages[telegramChatId]);
    } else {
      lastUserMessages[telegramChatId] = messageText; // Store the last message sent by the user
      soul.dispatch({
        action: "said",
        content: messageText,
      });
    
      await ctx.telegram.sendChatAction(telegramChatId, "typing");
    }
  });
}

function disconnectInactiveSouls() {
  const now = Date.now();
  const inactivityLimit = 3 * 60 * 1000; // 3 minutes

  for (const [chatId, soul] of Object.entries(souls)) {
    const lastActivity = lastMessageTimestamps[Number(chatId)];
    if (now - lastActivity > inactivityLimit) {
      soul.disconnect();
      delete souls[chatId];
      console.log(`Disconnected soul for chat ID ${chatId} due to inactivity.`);
    }
  }
}

async function run() {
  config();
  const telegram = await connectToTelegram();
  connectToSoulEngine(telegram);

  // Periodically check for inactive souls every minute
  setInterval(disconnectInactiveSouls, 60 * 1000);
}

run();