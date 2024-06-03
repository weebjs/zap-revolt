const axios = require("axios");
const { Client } = require("revolt.js");
const { token, prefix } = require('./config/config.json')
const Uploader = require("revolt-uploader");
const p = require("primebit.js")

let client = new Client();
const uploader = new Uploader(client);

client.on("ready", async () => {
    p.warning("Connecting.... ⌛")
    p.success("Connected to Revolt! ✅")
    p.log(`Logged in as ${client.user.username}!`);
    client.api.patch("/users/@me", { status: { text: `made by weeb.`, presence: "Idle" } });
});

client.on("messageCreate", async (message) => {
    if (message.content.startsWith(prefix + "anime")) {
        const query = message.content.slice((prefix + "anime").length).trim();
        const response = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${query}&page[limit]=1`);
        const anime = response.data.data[0];
        const animeTitle = anime.attributes.titles.en || anime.attributes.titles.en_jp;
        const animeSynopsis = anime.attributes.synopsis;
        const animeCoverImage = anime.attributes.coverImage.original;

        Promise.allSettled([
            uploader.uploadUrl(animeCoverImage, animeTitle + '.png')
        ]).then(attachments => { 
            message.channel.sendMessage({
                content: `Here's what I found for "${query}"`,
                embeds: [{
                    title: animeTitle,
                    description: animeSynopsis,
                    colour: "#F5C400",
                    media: attachments[0]
                }]
            });
        });
    }
});

client.loginBot(token);