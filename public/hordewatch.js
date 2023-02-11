"use strict";

import * as fb from './fb.js';
import * as req from './req.js';
import { tr } from './locale.js';
import * as elems from './elems.js';
import * as room from './room.js';
import * as chat from './chat.js';
import * as player from './player.js';
import * as subs from './subs.js';
import * as misc from './misc.js';
import * as update_loop from './update_loop.js';
import * as ws from './ws.js';
import * as cli from './cli.js';


cli.cli.hw = this;

chat.log("hordewatch client loaded!");

