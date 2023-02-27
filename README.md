# Discord Bot Volléria

Is a Discord bot to help us keep the control of our scrum rituals.

## Installation

Use the package manager [npm/yarn] to install all required packages and dependencies of the project.

```bash
npm install --save
```
or 

```bash
yarn add
```

## Usage
Once you already have all requirements of the project you need to create an .jon file called 'config.json' to pass some environments variables. Will be something like:

```
{
    "CLIENT_ID": "XXXXXXXXX", # your bot client's id, you can get this one on discord developers page in the tab "Application"
    "token": "XXXXXXXXX", # your bot secrets token also can get this one on discord developers page
}
```

After this you just need to be sure to run the deploy-commads.js before the actual application, you can simple run:

```bash
    node deploy-commands.js
```

and it's everything up to use the bot!.
