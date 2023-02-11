
import * as fb from './fb.js';
import * as elems from "./elems.js";

export {
  subs_langs,
  subs_videos,
  set_subs_video,
  set_subs_src,
}


const subs_langs = {
  "en": elems.subs_en,
  "ru": elems.subs_ru,
};


// "pmmm/ep1-en.vtt"
/** @type {Object<string, [string, string, string]>} */
let subs_videos = {
  "pmmm/ep1":  ["pmmm/ep1",  ".vtt", "PMMM Ep1" ],
  "pmmm/ep2":  ["pmmm/ep2",  ".vtt", "PMMM Ep2" ],
  "pmmm/ep3":  ["pmmm/ep3",  ".vtt", "PMMM Ep3" ],
  "pmmm/ep4":  ["pmmm/ep4",  ".vtt", "PMMM Ep4" ],
  "pmmm/ep5":  ["pmmm/ep5",  ".vtt", "PMMM Ep5" ],
  "pmmm/ep6":  ["pmmm/ep6",  ".vtt", "PMMM Ep6" ],
  "pmmm/ep7":  ["pmmm/ep7",  ".vtt", "PMMM Ep7" ],
  "pmmm/ep8":  ["pmmm/ep8",  ".vtt", "PMMM Ep8" ],
  "pmmm/ep9":  ["pmmm/ep9",  ".vtt", "PMMM Ep9" ],
  "pmmm/ep10": ["pmmm/ep10", ".vtt", "PMMM Ep10"],
  "pmmm/ep11": ["pmmm/ep11", ".vtt", "PMMM Ep11"],
  "pmmm/ep12": ["pmmm/ep12", ".vtt", "PMMM Ep12"],
};




/**
 * @param {string} video
 * @throws {Error}
 */
function set_subs_video(video) {
  if (!video) {
    return remove_subs_video();
  }

  let url_form = subs_videos[video];
  fb.assert(url_form != null, new Error(
    `Couldn't find video subtitles for ${video}!`));
  
  Object.entries(subs_langs).forEach(([lang, track]) => {
    let url = `${url_form[0]}-${lang}${url_form[1]}`;
    set_subs_src(track, url);
  });
}


function remove_subs_video() {
  Object.entries(subs_langs).forEach(([lang, track]) => {
    set_subs_src(track, "");
  });
}


/**
 * @param {HTMLTrackElement} subs
 * @param {string} src
 */
function set_subs_src(subs, src) {
  subs.src = src;
}


function on_select_subs() {
  let video = elems.select_subs.value;
  try {
    set_subs_video(video);
    console.log(`Loaded subtitles ${video}`);
  }
  catch (error) {
    console.log(error);
  }
}



/**
 * @param {string} id
 * @param {string} name
 */
function sub_option(id, name) {
  return `<option value="${id}">${name}</option>`;
}


function generate_sub_select() {
  let options = [
    sub_option("", "None"),
  ];
  Object.entries(subs_videos).map(([id, data]) => {
    options.push(sub_option(id, data[2]));
  });
  elems.select_subs.innerHTML = options.join("");
}



generate_sub_select();
elems.select_subs.addEventListener("change", on_select_subs);


// <select name="select_subs" id="select_subs">
// <option value="">None</option>
// <option value="pmmm/ep1">PMMM Ep1</option>
// <option value="pmmm/ep2">PMMM Ep2</option>
// </select>
