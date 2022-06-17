# Awesome Bot!

Awesome bot is a bot for Soonaverse (https://soonaverse.com/) which is automatically caching collection information, collection floor prices and computing rarities in real-time based on the occurrence of properties of the minted NFTs. 

The following command are supported:
- **!floor:** Display floor prices
- **!floor [rarity]:** Display floor prices with minimum rarity
- **!floor [prop]:** Display floor prices with a match in a certain property
- **!rarity [eth]:** List of top rarities on a certain eth address

## Prerequisites

1. Install node.js (https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
2. Install discord.js (https://discord.js.org/#/)
3. Install soonaverse-lib by following the following instructions: https://github.com/soonaverse/soonaverse-lib

## Setup

1. Create a discord bot using: https://discordpy.readthedocs.io/en/stable/discord.html
2. Your bot only requires permissions to 'send messages'
3. Insert your bot token into ___bot.mjs___
4. Invite the bot to your discord server

## Runtime

The bot can be run for any collection. Start the bot by running:

```
node bot.mjs [name] [prefix] [collection-address1] {collection-address-n}
```

- **[name]:** project name, for example 'casters'.
- **[prefix]:** the prefix you want to use, for example '!'. If you want to use '!' make sure to put if between quotation marks.
- **[collection-address]**: A list of maximum 10 collection addresses of the same NFT set (normal collection, givaway etc.)

Example:
```
node bot.mjs casters "!c" 0xc1b9e4721c5b517509e062b9950226e9603b5864 0xda3d918b482fb8ed5c7992cca457a8379d21c53f 0x761b606b804457ff7ed80316483c561b24a5c7fa
```

## Disclaimer

I'm not affiliated with any NFT project on Soonaverse nor Soonaverse itself. I've create the bot for fun to give something back to the community :-) The code might contain bugs and the rarity calculation may not be accurate for each project. Use the bot at your own risk!

## Donation

If you think the bot adds value to you project or trading experience or you just simply like it, feel free to donate some Mi, Gi or Ti  ;-) to : 

```iota1qp7es2e3v2cf7fczqg43rh4a27cky95g4x03wne53pwm4dzxklwp724j546```

[Firefly](iota://wallet/send/iota1qp7es2e3v2cf7fczqg43rh4a27cky95g4x03wne53pwm4dzxklwp724j546) | [TanglePay](tanglepay://send/iota1qp7es2e3v2cf7fczqg43rh4a27cky95g4x03wne53pwm4dzxklwp724j546)
