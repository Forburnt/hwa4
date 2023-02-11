
// server.js
"use strict";

require('dotenv').config();

const path = require("path");

// @ts-ignore
const fastify = require("fastify")({
  logger: false, // !! maybe set to false
  trustProxy: true,
});
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});
fastify.register(require("@fastify/formbody"));
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});
fastify.register(require('@fastify/websocket'));

const seo = require("./src/seo.json");
const translations = {
  en: require("./public/tr/en.json"),
  ru: require("./public/tr/ru.json"),
}

const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const san_user_input = input => sanitizeHtml(input, {
  allowedTags: ['b', 'i', 'em', 'strong', 'mono'],
  // allowedAttributes: {
  //   'a': [ 'href' ]
  // },
  // allowedIframeHostnames: ['www.youtube.com']
});
const MAX_MSG_LENGTH = 256;


let hordewatch = {};

/** @type {import('./src/server/view.mjs').View} */
var view;
// /** @type {Model} */
// var model;


/** 
 * @param {Request} request
 * @returns {any}
 */
// @ts-ignore
const parse_post_request = request => JSON.parse(request.body);


/**
 * @param {any} key
 * @param {any} value
 */
 function json_replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}


/** @param {string} msg */
function log(msg) {
  console.log(msg);
  fastify.log.info(msg);
}


function get_tr(request) {
  let accept_lang = request.query.lang ?? request.headers["accept-language"];
  let base_lang = accept_lang.split(",")[0].split("-")[0];
  return translations[base_lang] ?? translations.en;
}


function get_tr_code(request) {
  let accept_lang = request.query.lang ?? request.headers["accept-language"];
  let base_lang = accept_lang.split(",")[0].split("-")[0];
  return (base_lang in translations) ? base_lang : "en";
}



fastify.get("/", function (request, reply) {
  let tr_code = get_tr_code(request);
  log(`New connection from ${request.ip} with language ${tr_code}`);
  let q = request.query;

  let prefs = {
    width: q.width ?? "85",
  };

  let custom_seo = {...seo,
    image: q.v == "g" ? seo.image_g : seo.image,
    poster: q.v == "g" ? seo.poster_g : seo.poster,
  };

  let tr = get_tr(request);

  let params = { seo: custom_seo, prefs: prefs, tr: tr };
  return reply.view("/src/pages/index.hbs", params);
});



fastify.get("/get_tr", (request, reply) => {
  reply
    .type("application/json")
    .send(get_tr(request));
});


fastify.get("/help", (request, reply) => {
  let params = {
    
  };
  return reply.view("/src/pages/help.hbs", params);
});


fastify.get("/debug", (request, reply) => {
  if (request.query.password == process.env.password) {
    reply.send({view: view});
  } else {
    // reply.send({view: "Nothing to see here!"});
    let params = {
    
    };
    return reply.view("/src/pages/help.hbs", params);
  }
});


fastify.get("/debug2", (request, reply) => {
  if (request.query.password == process.env.password) {
    let v = JSON.stringify(view, json_replacer);
    reply.send(v);
  } else {
    reply.send({view: "Nothing to see here!"});
  }
});


fastify.post("/", function (request, reply) {
  let params = { seo: seo };

  // request.body
  
  return reply.view("/src/pages/index.hbs", params);
});


fastify.post("/allo", function (request, reply) {
  let body = parse_post_request(request);
  console.log(`Got /allo request body ${body}`);
  console.log(`Asked to sanitize ${body.sanitize_this_pls}`);
  console.log(`AKA ${body['sanitize_this_pls']}`);
  let san_text = sanitizeHtml(body.sanitize_this_pls);
  console.log(`Sanitized to ${san_text}`);
  reply.send({allo: `allo!\nsanitized this for you: ${san_text}`});
});


fastify.post("/join_room", function (request, reply) {
  let body = parse_post_request(request);
  reply.send(view.user_join_room(
    body.room_id, body.username, request.ip, true));
});


fastify.post("/leave_room", function (request, reply) {
  let body = parse_post_request(request);
  reply.send({
    todo: "left room",
  });
  // reply.send(view.user_join_room(
  //   body.room_id, body.username, request.ip, true));
});


fastify.post("/update", function (request, reply) {
  let body = parse_post_request(request);
  reply.send(view.user_update(
    body.room_id, body.username, request.ip));
});


fastify.post("/send_msg", function (request, reply) {
  let body = parse_post_request(request);
  // @ts-ignore
  let html = marked.parse(body.content).slice(0, MAX_MSG_LENGTH);
  let content = san_user_input(html);
  reply.send(view.send_msg(
    body.room_id, body.username, request.ip, content));
});


fastify.post("/set_player_status", function (request, reply) {
  let body = parse_post_request(request);
  reply.send(view.set_player_status(
    body.room_id, body.username, request.ip,
    body.is_playing, body.time, body.sent_at));
});


/** @typedef {import('@fastify/websocket').SocketStream} SocketStream */
/** @typedef {import('fastify').FastifyRequest} FastifyRequest */

fastify.register(async function(fastify) {
  fastify.get("/ws", { websocket: true },
    /** 
     * @param {SocketStream} connection
     * @param {FastifyRequest} req
    */
    function ws_handler(connection, req) {
      /**
       * @param {String} path
       * @param {any} data
       */
      function ws_send(path, data) {
        connection.socket.send(JSON.stringify({
          path: path,
          data: data,
        }));
      }

      const receivers = {
        /** @param {String} hello */
        "hello": hello => {
          console.log(`Client greets: ${hello}`);
          ws_send("hello", "hi from server!");
        },

        "join_room": body => ws_send("join_room", view.user_join_room(
          body.room_id, body.username, req.ip, true)),

        // leave room

        "update": body => ws_send("update", view.user_update(
          body.room_id, body.username, req.ip)),
        
        "send_msg": body => {
          // @ts-ignore
          let html = marked.parse(body.content).slice(0, MAX_MSG_LENGTH);
          let content = san_user_input(html);
          console.log(`#${body.room_id} ${body.username}: ${content}`);
          ws_send("send_msg", view.send_msg(
            body.room_id, body.username, req.ip, content));
        },

        "set_player_status": body => ws_send("set_player_status",
          view.set_player_status(
            body.room_id, body.username, req.ip,
            body.is_playing, body.time, body.sent_at)),
      };

      connection.socket.on("open", l => {
        console.log(`Client WS open: ${JSON.stringify(l)}`);
        // ws_send("hello", "hi from server!");
      });

      connection.socket.on("message", event => {
        let reply = JSON.parse(event.toString());
        let receiver = receivers[reply.path];
        if (receiver) {
          receiver(reply.data);
        } else {
          console.log(`Attempted to get invalid receiver: ${reply.path}!`);
        }
      });
    }
  );
});



async function setup_hordewatch() {
  hordewatch.view = await import("./src/server/view.mjs");
  hordewatch.req = await import("./src/server/model/req.mjs");
  hordewatch.fetch = await import("node-fetch");
  hordewatch.req.set_fetch(hordewatch.fetch.default);
  // console.log(hordewatch.fetch);
  view = new hordewatch.view.View();
  // hw.auth = await import("./src/server/auth.mjs");
  // model = new hw.auth.Model();
}


const listen_options = { port: process.env.PORT, host: "0.0.0.0" };
console.log(`env: ${JSON.stringify(process.env)}`)
if (process.env.should_start_server == "true") {
  fastify.listen(listen_options, async (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`${seo.title} is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  
    await setup_hordewatch();
  });
} else {
  console.log("Server start aborted.");
}


