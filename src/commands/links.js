const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios')
const { DATA_BASE_URL } = require('../config.json');

const instance = axios.create({
    baseURL: DATA_BASE_URL
  });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('links')
		.setDescription('Manage a list with all relevant links to the server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds a new link to the servers saved links list')
                .addStringOption(option => option.setName('key').setDescription('The value of key associated to the link').setRequired(true))
                .addStringOption(option => option.setName('url').setDescription('The url address that you want to save').setRequired(true))
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show the link associated with the key which matches')
                .addStringOption(option => option.setName('key').setDescription('The value of key associated to the link').setRequired(true))
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show_all')
                .setDescription('Show a full list with all the saved links')
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete the link associated with the key which matches')
                .addStringOption(option => option.setName('key').setDescription('The value of key associated to the link').setRequired(true))
                )
                ,
	async execute(interaction, client) {
        const sub_command = interaction.options.getSubcommand()
        var content = ""
        var is_embed = false

        switch (sub_command) {
            case 'add':
                content = await addLink(interaction.guild.id, interaction.options.getString('key'), interaction.options.getString('url'))
                break;
            case 'show':
                [content, is_embed] = await showLink(interaction.guild.id, interaction.options.getString('key')) 
                break;
            case 'show_all':
                [content, is_embed] = await showAllLinks(interaction.guild.id)
                break;
            case 'delete':
                content = await deleteLink(interaction.guild.id, interaction.options.getString('key'))
                break;
        }
        if (is_embed) await interaction.reply({ embeds: [content], fetchReply: true });
        else await interaction.reply({ content });
	},
};

async function addLink(guild_id, key, url){
    if (!url.includes('http')) url = 'http://' + url
    try {
        await instance.post(`/links/${guild_id}.json`, {key, url})
        return 'The link ' + key.toUpperCase() + ': ' + url + ' was added to the list. Try to use /links show_all to see all the links saved.'
    } catch (error) {
        console.log(error)
        return 'Something went while we tried to add your link to the list'
    }
}

async function showLink(guild_id, key){
    try {
        let res = await instance.get(`/links/${guild_id}.json`)
        let id_list = Object.keys(res.data)
        let matched_id = id_list.find(id => {
           return res.data[`${id}`]['key'].toLowerCase() === key.toLowerCase()
        })
        let title = res.data[`${matched_id}`].key.toUpperCase()
        let url = res.data[`${matched_id}`].url
        let embed = buildEmbedLink(title, url, url)
        return [embed, true]
    } catch (error) {
        console.log(error)
        return ['Something went while we tried to get your link', false]
    }
}

async function showAllLinks(guild_id){
    try {
        let res = await instance.get(`/links/${guild_id}.json`)
        let idList = Object.keys(res.data)
        let arrayList = idList.map(id => {
           return res.data[`${id}`]
        })
        let fields = arrayList.map((item) => {
            return { name: item.key.toUpperCase(), value: `[${item.url}](${item.url})` }
        })
        let embed = buildEmbedFields('All Links', fields)
        return [embed, true]
    } catch (error) {
        console.log(error)
        return ['Something went while we tried to get your link', false]
    }
}

async function deleteLink(guild_id, key){
    try {
        let res = await instance.get(`/links/${guild_id}.json`)
        let id_list = Object.keys(res.data)
        let matched_id = id_list.find(id => {
           return res.data[`${id}`]['key'].toLowerCase() === key.toLowerCase()
        })
        await instance.delete(`/links/${guild_id}/${matched_id}.json`)
        return 'Your link was successfully removed from the list.'
    } catch (error) {
        console.log(error)
        return 'Something went while we tried to get your link'
    }
}

function buildEmbedLink(title, description, url, color=0x0099ff){
    var embed = {
        title: title,
        description: description,
        url: url,
        color: color,
    }
    return embed
}

function buildEmbedFields(title, fields, url, color=0x0099ff){
    var embed = {
        title: title,
        fields: fields,
        url: url,
        color: color,
    }
    return embed
}
