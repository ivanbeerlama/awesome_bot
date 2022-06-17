#!/usr/bin/env node

// Awesome floor bot. Usage:
// - !floor: Display floor prices
// - !floor [rarity]: Display floor prices with minimum rarity
// - !floor [prop]: Display floor prices with a match in a certain property
// - !rarity [eth]: List of top rarities on a certain eth address

import { Soon } from 'soonaverse';

import Discord from 'discord.js';

const soon = new Soon();

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('Invalid number of arguments.\nUsage: node bot.mjs [name] [prefix] [collection-address1] {collection-address-n}');
    process.exit(1);
}

var name = args[0];
var prefix = args[1]; // Example: '!' or '!c' where c is the first character of the collection name

var collection = args.slice(2);

console.log('Collection name:', name)
console.log('Prefix:', prefix)
console.log('Collection addresses:', collection)

// ******** SETTINGS ********

// This is where the bot token goes.
var BOT_TOKEN = ""; // <--------------------------------------- INSERT YOUR BOT TOKEN HERE

var max_results = 30; // Limit rarity results to this amount
var max_floor_results = 5; // Limit floor results to this amount

var print_link = true; // Print links to NFT next to floor results
var link_prefix = "https://soonaverse.com/nft/" // For transparency don't use a link shortener!

var caching = true; // Limit getNftsByCollections to once every x minutes 
var cache_frequency = 30; // minutes

var floor_updates = true; // Monitor floor and notify in specific channel
var floor_updates_channel = "floor-updates";

// ******** END OF SETTINGS ********

var r_min = 0.0;
var r_max = 0.0;

var eyes_threshold = 125.0; // Initial value, adjusted dynamically
var rocket_threshold = 150.0;// Initial value, adjusted dynamically

var min_floor_price = 0.0;

var nfts;
var occurance = {};

function sortTogether(array1, array2) {
    var merged = [];
    for (var i = 0; i < array1.length; i++) { merged.push({ 'a1': array1[i], 'a2': array2[i] }); }
    merged.sort(function (o1, o2) { return ((o1.a1 < o2.a1) ? -1 : ((o1.a1 == o2.a1) ? 0 : 1)); });
    for (var i = 0; i < merged.length; i++) { array1[i] = merged[i].a1; array2[i] = merged[i].a2; }
}

// Compute rarity
function computeRarity(properties) {

    var r = 0.0

    for (const prop in properties) {

        if (properties[prop].label !== 'undefined') {
            r = r + 1.0 / occurance[prop][properties[prop].value];
        }
    }

    return r;
}

// Compute minimum floor price
function minFloorPrice(obj) {

    var a = [];
    var b = [];

    var min_mi = 0.0;

    for (const key in obj) {

        if (typeof obj[key].properties !== 'undefined'
            && typeof obj[key].availablePrice !== 'undefined'
            && typeof obj[key].saleAccessMembers !== 'undefined') {

            var p = obj[key].availablePrice;
            if (p !== null && obj[key].saleAccessMembers.length == 0) {
                var mi = p / 1000000;
                if (min_mi == 0.0 || mi < min_mi) {
                    min_mi = mi;
                }
            }
        }
    }
    return min_mi;
}

// Handle floor command
function handleFloor(obj) {

    var a = [];
    var b = [];

    console.log("Processing results...")

    for (const key in obj) {

        if (typeof obj[key].properties !== 'undefined'
            && typeof obj[key].availablePrice !== 'undefined'
            && typeof obj[key].saleAccessMembers !== 'undefined') {

            var p = obj[key].availablePrice;
            if (p !== null && obj[key].saleAccessMembers.length == 0) {
                var mi = p / 1000000;

                var r = computeRarity(obj[key].properties);
                var r2 = Math.round(r * 100) / 100;

                var r_str = "(" + r2 + ")";
                if (r >= eyes_threshold) {
                    r_str += " :eyes:"
                }
                if (r >= rocket_threshold) {
                    r_str += " :rocket:"
                }

                a.push(mi)

                if (print_link) {
                    b.push(obj[key].name + " " + r_str + ":\n<" + link_prefix + obj[key].uid + ">")
                } else {
                    b.push(obj[key].name + " " + r_str)
                }
            }
        }
    }

    console.log("Floor request done")

    sortTogether(a, b);

    if (a.length > 0) {

        var rep = "Floor results:";

        for (var i = 0; i < a.length && i < max_floor_results; i++) {

            rep = rep + "\n**" + a[i] + "Mi** " + b[i];
            //console.log(b[i] + ": " + a[i] + "Mi");
        }

        return rep;

    }

    return "";
}

// Handle advanced floor command
function handleFloorAdvanced(obj, min_rarity, search_property) {

    var a = [];
    var b = [];

    console.log("Processing results...", min_rarity, search_property)

    for (const key in obj) {

        if (typeof obj[key].properties !== 'undefined'
            && typeof obj[key].availablePrice !== 'undefined'
            && typeof obj[key].saleAccessMembers !== 'undefined') {


            var p = obj[key].availablePrice;
            if (p !== null && obj[key].saleAccessMembers.length == 0) {
                var mi = p / 1000000;
                var r = computeRarity(obj[key].properties);

                var proc = true;
                var extra = ""

                if (search_property !== "") {
                    proc = false;

                    for (const prop in obj[key].properties) {

                        if (obj[key].properties[prop].label !== 'undefined') {
                            if (obj[key].properties[prop].value.toLowerCase().includes(search_property)) {
                                proc = true;
                                extra = " - " + obj[key].properties[prop].label + ": " + obj[key].properties[prop].value + " ";
                            }
                        }
                    }
                }

                // Above minimum rarity and optional property found
                if (r > min_rarity && proc === true) {

                    var r2 = Math.round(r * 100) / 100;

                    var r_str = "(" + r2 + ")";
                    if (r >= eyes_threshold) {
                        r_str += " :eyes:"
                    }
                    if (r >= rocket_threshold) {
                        r_str += " :rocket:"
                    }

                    a.push(mi)

                    if (print_link) {
                        b.push(obj[key].name + extra + " " + r_str + ":\n<" + link_prefix + obj[key].uid + ">")
                    } else {
                        b.push(obj[key].name + extra + " " + r_str)
                    }
                }

            }

        }
    }

    console.log("Floor request done")

    sortTogether(a, b);

    if (a.length > 0) {


        var rep = "Floor results:";

        if (min_rarity > 0) {
            rep = rep + " (minimum rarity: " + min_rarity + ")"
        }

        if (search_property !== "") {
            rep = rep + " (with property: " + search_property + ")"
        }

        for (var i = 0; i < a.length && i < max_floor_results; i++) {

            rep = rep + "\n**" + a[i] + "Mi** " + b[i];
            //console.log(b[i] + ": " + a[i] + "Mi");
        }

        return rep;

    }
    return ""

}

// Handle discord messages
client.on("messageCreate", function (message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "floor") { // Floor price

        const numArgs = args.map(x => parseFloat(x));

        if (args.length == 0) {

            console.log("Floor request")

            if (caching) {

                var rep = handleFloor(nfts);
                if (rep !== "") {
                    message.reply(rep);
                }

            } else {

                soon.getNftsByCollections(collection).then((obj) => {

                    var rep = handleFloor(obj);
                    if (rep !== "") {
                        message.reply(rep);
                    }

                });

            }

        } else if (args.length == 1) {

            // minimum rarity or searchable property

            console.log("Floor request minimum rarity")

            var search_property = ""

            var min_rarity = parseInt(args[0].toLowerCase()) || 0;
            if (min_rarity <= 0) {
                min_rarity = 0;
                search_property = args[0].toLowerCase()
            }

            if (caching) {

                var rep = handleFloorAdvanced(nfts, min_rarity, search_property);
                if (rep !== "") {
                    message.reply(rep);
                }

            } else {

                soon.getNftsByCollections(collection).then((obj) => {

                    var rep = handleFloorAdvanced(obj, min_rarity, search_property)
                    if (rep !== "") {
                        message.reply(rep);
                    }

                });
            }
        }

    } else if (command === "rarity") { // Overview of collection rarity per eth address
        const numArgs = args.map(x => parseFloat(x));

        console.log("Rarity request")

        var filter1 = "";
        var filter2 = "";

        if (args.length >= 1) {

            var eth = args[0];

            soon.getNftsByEthAddress(eth).then((obj) => {

                var x = [];
                var y = [];

                for (const key in obj) {

                    if (collection.includes(obj[key].collection)) {

                        var r = computeRarity(obj[key].properties);

                        x.push(r)
                        y.push(obj[key].name)

                    }
                }

                sortTogether(x, y)

                var rep = "Rarity results (higher is better):";
                //console.log("Rarity results (higher if better):")

                var j = 0;

                for (var i = x.length - 1; i >= 0; i--) {

                    var p = Math.round(x[i] * 100) / 100;

                    rep = rep + "\n" + y[i] + ": " + p;

                    if (x[i] >= eyes_threshold) {
                        rep += " :eyes:"
                    }
                    if (x[i] >= rocket_threshold) {
                        rep += " :rocket:"
                    }

                    j = j + 1

                    if (j >= max_results) {
                        rep = rep + "\n*Limited to 30 results*";
                        break;
                    }

                }

                console.log("Rarity request done")

                if (x.length > 0) {
                    message.reply(rep);
                }
            })

        }


    }
});

client.login(BOT_TOKEN);

// Compute rarity by occurance of properties over complete collection
function computeRarities(obj) {

    // Collect properties
    var properties = {};

    for (const key in obj) {

        if (typeof obj[key].properties !== 'undefined') {

            for (const prop in obj[key].properties) {

                if (obj[key].properties[prop].label !== 'undefined') {

                    if (properties[prop] === undefined) {
                        properties[prop] = []
                    }

                    properties[prop].push(obj[key].properties[prop].value)
                    //console.log(obj[key].properties[prop].label  + "" + "" + obj[key].properties[prop].value)
                }
            }
        }
    }

    // Compute rarity based on property occurance
    for (const key in properties) {

        occurance[key] = {}

        var counts = {}

        for (const num of properties[key]) {
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }

        for (const num in counts) {
            //console.log(key, num, counts[num] / properties[key].length)
            occurance[key][num] = counts[num] / properties[key].length;
        }

    }

    // Compute min and max rarity
    for (const key in obj) {

        if (typeof obj[key].properties !== 'undefined') {
            var r = computeRarity(obj[key].properties)
            if (r > r_max || r_max == 0) {
                r_max = r
                if ((r < r_min && r > 0) || r_min == 0) {
                    r_min = r
                }
            }
        }
    }
    console.log("Range rarities: ", r_min, r_max);

    // Adjust eyes and rocket threshold
    if (r_max > 0 && r_min > 0) {
        var range = r_max - r_min;
        if (range > 0) {
            eyes_threshold = 0.8 * range + r_min; // Display eyes for top 20%
            rocket_threshold = 0.9 * range + r_min; // Display rocket for top 10%
        }

    }

    console.log("Eyes, Rocket: ", eyes_threshold, rocket_threshold);

}


if (caching) {

    console.log("Initializing collection");

    soon.getNftsByCollections(collection).then((obj) => {
        nfts = obj;
        computeRarities(nfts)
        console.log("Updated collection");

        if (floor_updates) {
            var mi = minFloorPrice(nfts)
            if (mi != min_floor_price) {
                const channel = client.channels.cache.find(channel => channel.name === floor_updates_channel)
                channel.send("[" + name + "] Floor update: " + min_floor_price + "Mi -> " + mi + "Mi");
                min_floor_price = mi;
            }
        }

    })

    setInterval(function () {

        soon.getNftsByCollections(collection).then((obj) => {
            nfts = obj;
            computeRarities(nfts)
            console.log("Updated collection");

            if (floor_updates) {
                var mi = minFloorPrice(nfts)
                if (mi != min_floor_price) {
                    const channel = client.channels.cache.find(channel => channel.name === floor_updates_channel)
                    channel.send("[" + name + "] Floor update: " + min_floor_price + "Mi -> " + mi + "Mi");
                    min_floor_price = mi;
                }
            }

        })
    }, cache_frequency * 60 * 1000);
}
