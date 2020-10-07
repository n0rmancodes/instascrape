const { IgApiClient }  = require('instagram-private-api');
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
    console.log("logging in...");
    const l = await ig.account.login(config.username, config.password);
    process.nextTick(async () => {
        await ig.simulate.postLoginFlow();
        if (!args[0]) {
            console.log("getting your follower list...");
            var fl = await ig.feed.accountFollowing(l.pk).request();
            console.log("getting your follower's posts...");
            if (!fs.existsSync("./images")) {fs.mkdirSync("./images/");}
            for (var c in fl.users) {
                const u = await getAllItemsFromFeed(ig.feed.user(fl.users[c].pk));
                if (!u.length > 0) {
                    console.log("- skipping " + fl.users[c].username + " (has no posts)");
                    continue;
                }
                if (!fs.existsSync("./images/" + fl.users[c].username)) {
                    fs.mkdirSync("./images/" + fl.users[c].username)
                }
                console.log("- scraping " + fl.users[c].username + "'s posts");
                for (var d in u) {
                    if (u[d].carousel_media) {
                        // carousel media
                        var foldName = "./images/" + fl.users[c].username + "/" + u[d].id;
                        if (fs.existsSync(fileName)) {
                            if (config.verbose && config.verbose == true) {
                                console.log("[i] already downloaded " + u[d].id);
                                continue;
                            } else {
                                continue;
                            }
                        } else {
                            for (var e in u[d].carousel_media) {
                                if (u[d].carousel_media[e].image_versions2 && !u[d].carousel_media[e].video_versions) {
                                    // carousel images
                                    if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")}
                                    var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + "/" + u[d].carousel_media[e].id + ".jpg";
                                    var itemId = "[i] downloaded " + u[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                    if (fs.existsSync(fileName)) {
                                        if (config.verbose && config.verbose == true) {
                                            console.log("[i] already downloaded " + u[d].id);
                                            continue;
                                        } else {
                                            continue;
                                        }
                                    }
                                    var bestUrl = u[d].carousel_media[e].image_versions2.candidates[0].url;
                                    var fn = fs.createWriteStream(fileName);
                                    fs.appendFileSync(fileName, "");
                                    req(bestUrl).on("error", function(e) {
                                        //ignore errors
                                    }).pipe(fn);
                                    console.log(itemId);
                                } else if (u[d].carousel_media[e].video_versions) {
                                    // carousel videos
                                    if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")}
                                    var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + "/" + u[d].carousel_media[e].id + ".mp4";
                                    var itemId = "[i] downloaded " + u[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                    var bestUrl = u[d].carousel_media[e].video_versions[0].url;
                                    var fn = fs.createWriteStream(fileName);
                                    fs.appendFileSync(fileName, "");
                                    req(bestUrl).on("error", function(e) {
                                        //ignore errors
                                    }).pipe(fn);
                                    console.log(itemId);
                                }
                            }
                        }
                    } else if (u[d].image_versions2 && u[d].video_versions) {
                        // single videos 
                        var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + ".mp4";
                        if (fs.existsSync(fileName)) {
                            if (config.verbose && config.verbose == true) {
                                console.log("[i] already downloaded " + u[d].id);
                                continue;
                            } else {
                                continue;
                            }
                        }
                        var itemId = "[i] downloaded " + u[d].id.toString() + " from " + fl.users[c].username;                                
                        var bestUrl = u[d].video_versions[0].url;
                        var fn = fs.createWriteStream(fileName);
                        fs.appendFileSync(fileName, "");
                        req(bestUrl).on("error", function(e) {
                            //ignore errors
                        }).pipe(fn);
                        console.log(itemId);
                    } else if (u[d].image_versions2 && !u[d].video_versions) {
                        // single images
                        var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + ".jpg";
                        var itemId = "[i] downloaded " + u[d].id.toString() + " from " + fl.users[c].username;
                        if (fs.existsSync(fileName)) {
                            if (config.verbose && config.verbose == true) {
                                console.log("[i] already downloaded " + u[d].id);
                                continue;
                            } else {
                                continue;
                            }
                        }
                        var bestUrl = u[d].image_versions2.candidates[0].url;
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
                    const u = await getAllItemsFromFeed(ig.feed.user(fl.users[c].pk));
                    if (!fs.existsSync("./images/" + fl.users[c].username)) {fs.mkdirSync("./images/" + fl.users[c].username)}
                    console.log("- scraping " + fl.users[c].username + "'s posts");
                    for (var d in u) {
                        if (u[d].carousel_media) {
                            // carousel media
                            var foldName = "./images/" + fl.users[c].username + "/" + u[d].id;
                            if (fs.existsSync(foldName)) {
                                console.log("[i] already downloaded " + u[d].id);
                                continue;
                            } else {
                                for (var e in u[d].carousel_media) {
                                    if (u[d].carousel_media[e].image_versions2 && !u[d].carousel_media[e].video_versions) {
                                        // carousel images
                                        if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")}
                                        var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + "/" + u[d].carousel_media[e].id + ".jpg";
                                        var itemId = "[i] downloaded " + u[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                        var bestUrl = u[d].carousel_media[e].image_versions2.candidates[0].url;
                                        var fn = fs.createWriteStream(fileName);
                                        fs.appendFileSync(fileName, "");
                                        req(bestUrl).on("error", function(e) {
                                            //ignore errors
                                        }).pipe(fn);
                                        console.log(itemId);
                                    } else if (u[d].carousel_media[e].video_versions) {
                                        // carousel videos
                                        if (!fs.existsSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")) {fs.mkdirSync("./images/" + fl.users[c].username + "/" + u[d].id + "/")}
                                        var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + "/" + u[d].carousel_media[e].id + ".mp4";
                                        var itemId = "[i] downloaded " + u[d].carousel_media[e].id + " from " + fl.users[c].username + " (carousel media)";
                                        var bestUrl = u[d].carousel_media[e].video_versions[0].url;
                                        var fn = fs.createWriteStream(fileName);
                                        fs.appendFileSync(fileName, "");
                                        req(bestUrl).on("error", function(e) {
                                            //ignore errors
                                        }).pipe(fn);
                                        console.log(itemId);
                                    }
                                }
                            }
                        } else if (u[d].image_versions2 && u[d].video_versions) {
                            // single videos 
                            var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + ".mp4";
                            if (fs.existsSync(fileName)) {
                                if (config.verbose && config.verbose == true) {
                                    console.log("[i] already downloaded " + u[d].id);
                                    continue;
                                } else {
                                    continue;
                                }
                            }
                            var itemId = "[i] downloaded " + u[d].id.toString() + " from " + fl.users[c].username;                                
                            var bestUrl = u[d].video_versions[0].url;
                            var fn = fs.createWriteStream(fileName);
                            fs.appendFileSync(fileName, "");
                            req(bestUrl).on("error", function(e) {
                                //ignore errors
                            }).pipe(fn);
                            console.log(itemId);
                        } else if (u[d].image_versions2 && !u[d].video_versions) {
                            // single images
                            var fileName = "./images/" + fl.users[c].username + "/" + u[d].id + ".jpg";
                            var itemId = "[i] downloaded " + u[d].id.toString() + " from " + fl.users[c].username;
                            if (fs.existsSync(fileName)) {
                                if (config.verbose && config.verbose == true) {
                                    console.log("[i] already downloaded " + u[d].id);
                                    continue;
                                } else {
                                    continue;
                                }
                            }
                            var bestUrl = u[d].image_versions2.candidates[0].url;
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
        } else if (args[0] == "--self") {
            const u = await getAllItemsFromFeed(ig.feed.user(l.pk));
            if (!fs.existsSync("./images/" + l.username)) {fs.mkdirSync("./images/" + l.username)}
            console.log("scraping " + l.username + "'s posts")
            for (var d in u) {
                if (u[d].carousel_media) {
                    // carousel media
                    var foldName = "./images/" + l.username + "/" + u[d].id;
                    if (fs.existsSync(foldName)) {
                        console.log("[i] already downloaded " + u[d].id);
                        continue;
                    } else {
                        for (var e in u[d].carousel_media) {
                            if (u[d].carousel_media[e].image_versions2 && !u[d].carousel_media[e].video_versions) {
                                // carousel images
                                if (!fs.existsSync("./images/" + l.username + "/" + u[d].id + "/")) {fs.mkdirSync("./images/" + l.username + "/" + u[d].id + "/")}
                                var fileName = "./images/" + l.username + "/" + u[d].id + "/" + u[d].carousel_media[e].id + ".jpg";
                                var itemId = "[i] downloaded " + u[d].carousel_media[e].id + " from " + l.username + " (carousel media)";
                                var bestUrl = u[d].carousel_media[e].image_versions2.candidates[0].url;
                                var fn = fs.createWriteStream(fileName);
                                fs.appendFileSync(fileName, "");
                                req(bestUrl).on("error", function(e) {
                                    //ignore errors
                                }).pipe(fn);
                                console.log(itemId);
                            } else if (u[d].carousel_media[e].video_versions) {
                                // carousel videos
                                if (!fs.existsSync("./images/" + l.username + "/" + u[d].id + "/")) {fs.mkdirSync("./images/" + l.username + "/" + u[d].id + "/")}
                                var fileName = "./images/" + l.username + "/" + u[d].id + "/" + u[d].carousel_media[e].id + ".mp4";
                                var itemId = "[i] downloaded " + u[d].carousel_media[e].id + " from " + l.username + " (carousel media)";
                                var bestUrl = u[d].carousel_media[e].video_versions[0].url;
                                var fn = fs.createWriteStream(fileName);
                                fs.appendFileSync(fileName, "");
                                req(bestUrl).on("error", function(e) {
                                    //ignore errors
                                }).pipe(fn);
                                console.log(itemId);
                            }
                        }
                    }
                } else if (u[d].image_versions2 && u[d].video_versions) {
                    // single videos 
                    var fileName = "./images/" + l.username + "/" + u[d].id + ".mp4";
                    if (fs.existsSync(fileName)) {
                        if (config.verbose && config.verbose == true) {
                            console.log("[i] already downloaded " + u[d].id);
                            continue;
                        } else {
                            continue;
                        }
                    }
                    var itemId = "[i] downloaded " + u[d].id.toString() + " from " + l.username;                                
                    var bestUrl = u[d].video_versions[0].url;
                    var fn = fs.createWriteStream(fileName);
                    fs.appendFileSync(fileName, "");
                    req(bestUrl).on("error", function(e) {
                        //ignore errors
                    }).pipe(fn);
                    console.log(itemId);
                } else if (u[d].image_versions2 && !u[d].video_versions) {
                    // single images
                    var fileName = "./images/" + l.username + "/" + u[d].id + ".jpg";
                    var itemId = "[i] downloaded " + u[d].id.toString() + " from " + l.username;
                    if (fs.existsSync(fileName)) {
                        if (config.verbose && config.verbose == true) {
                            console.log("[i] already downloaded " + u[d].id);
                            continue;
                        } else {
                            continue;
                        }
                    }
                    var bestUrl = u[d].image_versions2.candidates[0].url;
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

async function getAllItemsFromFeed(feed) {
    let items = [];
    do {
        items = items.concat(await feed.items());
    } while(feed.isMoreAvailable());
    return items;
}