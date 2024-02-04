const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const schedule = require('node-schedule');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: '/usr/bin/google-chrome'
        // Replace according to your Chrome file location
    }
});

client.on('qr', (qr) => {
    console.log('QR ACCEPTED', qr);
});

client.on('ready', () => {
    console.log('CLIENT READY!');
});

const prefix = ".";

client.on('message', async msg => {
    if (msg.body[0] === prefix) {
        const [cmd, ...args] = msg.body.slice(1).split(" ");
        const argString = args.join(" ");

        //Default Response Section
        if (cmd === "hai") {
            const response = 'Hello! This bot is in its final stages and is no longer being developed. Currently the bot can only turn photos into stickers, videos into stickers, and GIFs into stickers. Please send the photo you want to make into a sticker.';
            client.sendMessage(msg.from, response);
        }

        //Section for Making Stickers
        if (cmd === "sticker") {
            const attachmentData = await msg.downloadMedia();
            client.sendMessage(msg.from, attachmentData, { sendMediaAsSticker: true });
        }

        //Automatic Message Section
        if (cmd === "automessage") {
           // Make sure the user provides the time (hours and minutes)
            if (args.length === 2 && /^\d{2}:\d{2}$/.test(argString)) {
                const [hour, minute] = args[0].split(":").map(Number);
                const message = 'Messages automatically set by the user!';
                const contact = msg.from;

                sendScheduledMessage(contact, message, hour, minute);
                client.sendMessage(msg.from, `An automatic message is set for that hour ${hour}:${minute}`);
            } else {
                client.sendMessage(msg.from, 'Invalid time format. Use HH:mm format, for example 08:30');
            }
        }

        if (cmd === "change automatic message") {
            if (args.length > 0) {
                const newMessage = argString;
                const contact = msg.from;

                updateScheduledMessage(contact, newMessage);
                client.sendMessage(msg.from, 'Automatic message changed successfully.');
            } else {
                client.sendMessage(msg.from, 'Use the `.change automessage <new message>` command to change the automessage.');
            }
        }

        if (cmd === "auto delete messages") {
            const contact = msg.from;

            removeScheduledMessage(contact);
            client.sendMessage(msg.from, 'The message was automatically deleted successfully.');
        }
    }
});

client.initialize();

function sendScheduledMessage(contact, message, hour, minute) {
    const rule = new schedule.RecurrenceRule();
    rule.hour = hour;
    rule.minute = minute;

    schedule.scheduleJob({ ...rule, tz: 'Asia/Jakarta' }, async () => {
        await client.sendMessage(contact, message);
    });
}

function updateScheduledMessage(contact, newMessage) {
    stopScheduledMessage(contact);
    sendScheduledMessage(contact, newMessage, 12, 0);
}

function removeScheduledMessage(contact) {
    stopScheduledMessage(contact);
}

function stopScheduledMessage(contact) {
    schedule.cancelJob(contact);
}
