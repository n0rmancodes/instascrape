# InstaScrape
InstaScrape is a terminal tool used to scrape Instagram pages quickly and efficiently.

## Disclaimer
This tool is not authorized and may lead to your account being suspended or kicked off
Instagram. Use this tool at your own risk. I am not responsible for what Instagram does
if they catch you using this tool. *However, I use this personally and I haven't gotten caught.*

Your credentials never leave the Instagram servers. If you don't believe me, you can run Wireshark 
or any other network analysing program to see all outgoing connections are going exclusively to 
Instagram servers or audit the code yourself.

## Common Errors
### ``IgResponseError - 429``
This means Instagram has detected a high number of requests from your IP address. This can be fixed
via connecting to a proxy or a VPN like [Windscribe](https://windscribe.com).

## Use Cases
- If your friend's reset their accounts often.
- If a friend is deleting their account soon.
- If you want a backup of all of the accounts you follow.
- If you'd like to have a higher quality, uncropped photo than seen on your phone.

## Installation
1. Install the latest version of NodeJS.
2. Install dependencies via ``npm i``.
3. Run the command ``node firstrun.js``.
4. Open the ``config.json`` file it generated to configurate the program by entering your username and password.
5. [See the usage part of this document to find how you can use this program](https://github.com/n0rmancodes/instascrape#usage)

## Usage
### all accounts you follow
Run ``node instascrape.js`` to scrape all accounts that you follow.
### a certain account you follow
Run ``node instascrape.js --user [username]`` to scrape certain users.

*You must be following the account to scrape it.*

### scrape your own account
Run ``node instascrape.js --self`` to scrape your own account.