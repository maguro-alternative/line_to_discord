// Response for GAS
const http = require("http");
const querystring = require('querystring');

http.createServer(function(req, res){
 if (req.method == 'POST'){
   var data = "";
   req.on('data', function(chunk){
     data += chunk;
   });
   req.on('end', function(){
     if(!data){
        console.log("No post data");
        res.end();
        return;
     }
     var dataObject = querystring.parse(data);
     console.log("post:" + dataObject.type);
     if(dataObject.type == "wake"){
       console.log("Woke up in post");
       res.end();
       return;
     }
     res.end();
   });
 }
 else if (req.method == 'GET'){
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('Discord Bot is active now\n');
 }
}).listen(3000);

// Discord bot implements
const discord = require("discord.js");
const client = new discord.Client();

client.on("ready", message => {
  // botのステータス表示
  client.user.setPresence({ game: { name: "with discord.js" } });
  console.log("bot is ready!");
});

client.on("message", message => {
  // if (message.author.bot && message.author.id!=852152735578456115) {
  if (message.author.bot) {
    console.log("botcansel");
    return;
  }
  // DMには応答しない
  if (message.channel.type == "dm") {
    return;
  }

  var msg = message;

  // botへのリプライは無視
  if (msg.channel.id==867666631197982741 || msg.channel.id==871289038181646367 || msg.channel.id==838939721198469120 || msg.channel.id==877767122414100480 || msg.channel.id==838965654438543390 || msg.channel.id==906691166286803004) {
    console.log("bot is cansel");
    return;
  } else {
    //GASにメッセージを送信
    sendGAS(msg);
    return;
  }

  function sendGAS(msg) {
    if (msg.attachments.size) {
      // 添付された全ての画像(ファイル)のURLを取得する
      //console.log(msg.attachments.first().url);
      console.log(msg.attachments.size);
      var jsonData = {
        events: [
          {
            type: "discord",
            image: msg.attachments.first().url
          }
        ]
      }
    }else{
      var jsonData = {
        events: [
          {
            type: "discord",
            channelname: msg.channel.name,
            name: msg.author.username,
            message: msg.content
          }
        ]
      };
    }
    //GAS URLに送る
    console.log(msg.author.username);
    console.log(msg.content);
    //console.log(msg.attachments.first().url);
    //console.log(msg);
    post(process.env.GAS_URL, jsonData);
  }

  function post(url, data) {
    //requestモジュールを使う
    //console.log("a");
    var request = require("request");
    var options = {
      uri: url,
      headers: { "Content-type": "application/json" },
      json: data,
      followAllRedirects: true
    };
    // postする
    request.post(options, function(error, response, body) {
      if (error != null) {
        msg.reply("更新に失敗しました");
        console.log("更新に失敗しました");
        return;
      }

      var userid = response.body.userid;
      var channelid = response.body.channelid;
      var message = response.body.message;
      if (
        userid != undefined &&
        channelid != undefined &&
        message != undefined
      ) {
        var channel = client.channels.get(channelid);
        if (channel != null) {
          channel.send(message);
        }
      }
    });
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("please set ENV: DISCORD_BOT_TOKEN");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);