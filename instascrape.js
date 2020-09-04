const { IgApiClient, IgResponseError }  = require('instagram-private-api');
const fs = require("fs");
const chalk = require("chalk");
const req = require("request");
const args = process.argv.slice(2);
if (!fs.existsSync("config.json")) {console.log(chalk.red("please follow all of the installation instructions @ https://github.com/n0rmancodes/instascrape")); return;}
const config = JSON.parse(fs.readFileSync("config.json"));

if (config.username == "" | config.password == "") {console.log(chalk.red("please follow all of the installation instructions @ https://github.com/n0rmancodes/instascrape")); return;}

(async () => {
    const ig = new IgApiClient();
    cls();
    if (args[0] == "--user" && !args[1]) {
        console.log(chalk.red("ERR!") + chalk.redBright(" This parameter requires an argument like `node instascrape.js --user somecallmenorman`."));
        return;
    }
    console.log("generating device id...");
    await ig.state.generateDevice(config.username);
    await ig.simulate.preLoginFlow();
    console.log("- generated device id");
    console.log("logging in...");
    const l = await ig.account.login(config.username, config.password);
    process.nextTick(async () => {
        await ig.simulate.postLoginFlow();
        console.log("- logged in");
        if (!args[0]) {
            console.log("getting your follower list");
            var fl = await ig.feed.accountFollowing(l.pk).request();
            console.log("- got list, you are following " + fl.users.length + " people");
            console.log("getting your follower's posts...");
            if (!fs.existsSync("./images")) {fs.mkdirSync("./images/");}
            for (var c in fl.users) {
                const u = await ig.feed.user(fl.users[c].pk).request();
                if (!fs.existsSync("./images/" + fl.users[c].username)) {fs.mkdirSync("./images/" + fl.users[c].username)}
                console.log("- scraping " + fl.users[c].username + "'s posts");
                for (var d in u.items) {
                    if (u.items[d].carousel_media) {
                        // carousel media
                        var foldName = "./images/" + fl.users[c].username + "/" + u.items[d].id;
                        if (fs.existsSync(foldName)) {
                            console.log("[i] already downloaded " + u.items[d].id);
                            continue;
                        } else {
                            for (var e in u.items[d].carousel_media) {
                                if (u.items[d].carousel_media[e].image_versions2 && !u.items[d].carousel_media[e].video_versions) {
                                    // carousel images
                                    if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")}
                                    var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + "/" + u.items[d].carousel_media[e].id + ".jpg";
                                    var itemId = "[i] downloaded " + u.items[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                    if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                                    var bestUrl = u.items[d].carousel_media[e].image_versions2.candidates[0].url;
                                    var fn = fs.createWriteStream(fileName);
                                    fs.appendFileSync(fileName, "");
                                    req(bestUrl).on("error", function(e) {
                                        //ignore errors
                                    }).pipe(fn);
                                    console.log(itemId);
                                } else if (u.items[d].carousel_media[e].video_versions) {
                                    // carousel videos
                                    if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")}
                                    var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + "/" + u.items[d].carousel_media[e].id + ".mp4";
                                    var itemId = "[i] downloaded " + u.items[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                    var bestUrl = u.items[d].carousel_media[e].video_versions[0].url;
                                    var fn = fs.createWriteStream(fileName);
                                    fs.appendFileSync(fileName, "");
                                    req(bestUrl).on("error", function(e) {
                                        //ignore errors
                                    }).pipe(fn);
                                    console.log(itemId);
                                }
                            }
                        }
                    } else if (u.items[d].image_versions2 && u.items[d].video_versions) {
                        // single videos 
                        var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + ".mp4";
                        if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                        var itemId = "[i] downloaded " + u.items[d].id.toString() + " from " + fl.users[c].username;                                
                        var bestUrl = u.items[d].video_versions[0].url;
                        var fn = fs.createWriteStream(fileName);
                        fs.appendFileSync(fileName, "");
                        req(bestUrl).on("error", function(e) {
                            //ignore errors
                        }).pipe(fn);
                        console.log(itemId);
                    } else if (u.items[d].image_versions2 && !u.items[d].video_versions) {
                        // single images
                        var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + ".jpg";
                        var itemId = "[i] downloaded " + u.items[d].id.toString() + " from " + fl.users[c].username;
                        if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                        var bestUrl = u.items[d].image_versions2.candidates[0].url;
                        var fn = fs.createWriteStream(fileName);
                        fs.appendFileSync(fileName, "");
                        req(bestUrl).on("error", function(e) {
                            //ignore errors
                        }).pipe(fn);
                        console.log(itemId);
                    }
                }
            }
        } else if (args[0] == "--user" && args[1]) {
            const fl = await ig.feed.accountFollowing(l.pk).request();
            const user = args[1].toLocaleLowerCase();
            console.log("checking your follow list...")
            for (var c in fl.users) {
                if (fl.users[c].username == user) {
                    const u = await ig.feed.user(fl.users[c].pk).request();
                    if (!fs.existsSync("./images/" + fl.users[c].username)) {fs.mkdirSync("./images/" + fl.users[c].username)}
                    console.log("- scraping " + fl.users[c].username + "'s posts");
                    for (var d in u.items) {
                        if (u.items[d].carousel_media) {
                            // carousel media
                            var foldName = "./images/" + fl.users[c].username + "/" + u.items[d].id;
                            if (fs.existsSync(foldName)) {
                                console.log("[i] already downloaded " + u.items[d].id);
                                continue;
                            } else {
                                for (var e in u.items[d].carousel_media) {
                                    if (u.items[d].carousel_media[e].image_versions2 && !u.items[d].carousel_media[e].video_versions) {
                                        // carousel images
                                        if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")}
                                        var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + "/" + u.items[d].carousel_media[e].id + ".jpg";
                                        var itemId = "[i] downloaded " + u.items[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                        if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                                        var bestUrl = u.items[d].carousel_media[e].image_versions2.candidates[0].url;
                                        var fn = fs.createWriteStream(fileName);
                                        fs.appendFileSync(fileName, "");
                                        req(bestUrl).on("error", function(e) {
                                            //ignore errors
                                        }).pipe(fn);
                                        console.log(itemId);
                                    } else if (u.items[d].carousel_media[e].video_versions) {
                                        // carousel videos
                                        if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u.items[d].id + "/")}
                                        var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + "/" + u.items[d].carousel_media[e].id + ".mp4";
                                        var itemId = "[i] downloaded " + u.items[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                        var bestUrl = u.items[d].carousel_media[e].video_versions[0].url;
                                        var fn = fs.createWriteStream(fileName);
                                        fs.appendFileSync(fileName, "");
                                        req(bestUrl).on("error", function(e) {
                                            //ignore errors
                                        }).pipe(fn);
                                        console.log(itemId);
                                    }
                                }
                            }
                        } else if (u.items[d].image_versions2 && u.items[d].video_versions) {
                            // single videos 
                            var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + ".mp4";
                            if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                            var itemId = "[i] downloaded " + u.items[d].id.toString() + " from " + fl.users[c].username;                                
                            var bestUrl = u.items[d].video_versions[0].url;
                            var fn = fs.createWriteStream(fileName);
                            fs.appendFileSync(fileName, "");
                            req(bestUrl).on("error", function(e) {
                                //ignore errors
                            }).pipe(fn);
                            console.log(itemId);
                        } else if (u.items[d].image_versions2 && !u.items[d].video_versions) {
                            // single images
                            var fileName = "./images/" + fl.users[c].username + "/" + u.items[d].id + ".jpg";
                            var itemId = "[i] downloaded " + u.items[d].id.toString() + " from " + fl.users[c].username;
                            if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                            var bestUrl = u.items[d].image_versions2.candidates[0].url;
                            var fn = fs.createWriteStream(fileName);
                            fs.appendFileSync(fileName, "");
                            req(bestUrl).on("error", function(e) {
                                //ignore errors
                            }).pipe(fn);
                            console.log(itemId);
                        }
                    }
                } else {
                    continue;
                }
            } 
        } else {
            const u = await ig.feed.user(l.pk).request();
            if (!fs.existsSync("./images/" + l.username)) {fs.mkdirSync("./images/" + l.username)}
            console.log("scraping " + l.username + "'s posts")
            for (var d in u.items) {
                if (u.items[d].carousel_media) {
                    // carousel media
                    var foldName = "./images/" + l.username + "/" + u.items[d].id;
                    if (fs.existsSync(foldName)) {
                        console.log("[i] already downloaded " + u.items[d].id);
                        continue;
                    } else {
                        for (var e in u.items[d].carousel_media) {
                            if (u.items[d].carousel_media[e].image_versions2 && !u.items[d].carousel_media[e].video_versions) {
                                // carousel images
                                if (!fs.existsSync("./images/" + l.username + "/" + u.items[d].id + "/")) {fs.mkdirSync("./images/" + l.username + "/" + u.items[d].id + "/")}
                                var fileName = "./images/" + l.username + "/" + u.items[d].id + "/" + u.items[d].carousel_media[e].id + ".jpg";
                                var itemId = "[i] downloaded " + u.items[d].carousel_media[e].id + " from " + l.username + " (carousel media)";
                                if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                                var bestUrl = u.items[d].carousel_media[e].image_versions2.candidates[0].url;
                                var fn = fs.createWriteStream(fileName);
                                fs.appendFileSync(fileName, "");
                                req(bestUrl).on("error", function(e) {
                                    //ignore errors
                                }).pipe(fn);
                                console.log(itemId);
                            } else if (u.items[d].carousel_media[e].video_versions) {
                                // carousel videos
                                if (!fs.existsSync("./images/" + l.username + "/" + u.items[d].id + "/")) {fs.mkdirSync("./images/" + l.username + "/" + u.items[d].id + "/")}
                                var fileName = "./images/" + l.username + "/" + u.items[d].id + "/" + u.items[d].carousel_media[e].id + ".mp4";
                                var itemId = "[i] downloaded " + u.items[d].carousel_media[e].id + " from " + l.username + " (carousel media)";
                                var bestUrl = u.items[d].carousel_media[e].video_versions[0].url;
                                var fn = fs.createWriteStream(fileName);
                                fs.appendFileSync(fileName, "");
                                req(bestUrl).on("error", function(e) {
                                    //ignore errors
                                }).pipe(fn);
                                console.log(itemId);
                            }
                        }
                    }
                } else if (u.items[d].image_versions2 && u.items[d].video_versions) {
                    // single videos 
                    var fileName = "./images/" + l.username + "/" + u.items[d].id + ".mp4";
                    if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                    var itemId = "[i] downloaded " + u.items[d].id.toString() + " from " + l.username;                                
                    var bestUrl = u.items[d].video_versions[0].url;
                    var fn = fs.createWriteStream(fileName);
                    fs.appendFileSync(fileName, "");
                    req(bestUrl).on("error", function(e) {
                        //ignore errors
                    }).pipe(fn);
                    console.log(itemId);
                } else if (u.items[d].image_versions2 && !u.items[d].video_versions) {
                    // single images
                    var fileName = "./images/" + l.username + "/" + u.items[d].id + ".jpg";
                    var itemId = "[i] downloaded " + u.items[d].id.toString() + " from " + l.username;
                    if (fs.existsSync(fileName)) {console.log("[i] already downloaded " + u.items[d].id); continue;}
                    var bestUrl = u.items[d].image_versions2.candidates[0].url;
                    var fn = fs.createWriteStream(fileName);
                    fs.appendFileSync(fileName, "");
                    req(bestUrl).on("error", function(e) {
                        //ignore errors
                    }).pipe(fn);
                    console.log(itemId);
                }
            }
        }
    });
})();

function cls() {
    console.clear();
    console.log(chalk.blue("instascrape - instagram scraper"));
    console.log("===============================");
}