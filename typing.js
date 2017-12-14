
var total_press = 0;
var correct_press = 0;
var cur_cursor = 0;
var first_key_time = null;
var cur_wpm = 0;
var word_list;
var idle_timer = null;
var history_stats = {
   training_time: 0,
   wpm: 0
};

var training_options = {
   mode: 'single_letter',  // 'user_specified_letters', 'single_letter',
                           // 'random_letters',
                           // 'letters_with_space', 'words', 'sentences';
   user_defined: '',       // Used on if the mode is user_specified_letters.
   include_num: false,
   include_sym1: false, // ;:'",<.>/?
   include_sym2: false, // everything else.
   include_upper_case: false
};

function reset_session_stats() {
   total_press = 0;
   correct_press = 0;
   first_key_time = null;
   cur_cursor = 0;
}

function get_combo() {
   text = word_list[Math.floor(Math.random() * word_list.length)];
   if (training_options.include_upper_case &&
         Math.floor(Math.random() * 100) < 33) {
      text = text[0].toUpperCase() + text.slice(1);
   }
   return text.replace(/[\n\r]+/g, '').trim();
}

function get_a_char() {
   var text;
   var possible = "abcdefghijklmnopqrstuvwxyz";
   possible += "qwertyuiopzxcvbnm"; // Add weight to upper and lower row;
   possible += "rtyuvbnm"; // add weight to the index finger keys.
   text = possible.charAt(Math.floor(Math.random() * possible.length));
   if (training_options.include_upper_case &&
         Math.floor(Math.random() * 100) < 40) {
      text = text.toUpperCase();
   }
   return text;
}

function get_random_letters() {
   var i = 0, text = '';
   for (i = 0; i < 5; i ++) {
      text += get_a_char();
   }
   return text;
}
function get_new_text() {
   if (training_options.mode === 'single_letter') {
      return get_a_char();
   } else if (training_options.mode === 'words') {
      return get_combo();
   } else if (training_options.mode === 'random_letters') {
      return get_random_letters();
   } else {
      console.log('Unknow training mode.');
   }
}

function get_on_screen_text() {
   var text = '';
   var target_box = document.getElementById('target_box');
   var children = target_box.childNodes;
   for (var i = 0; i < children.length; i++) {
      if (children[i].classList && children[i].classList.contains('letterbox')) {
         text += children[i].textContent;
      }
   }
   return text;
}

function update_session_stats(key_is_correct) {
   total_press += 1;
   if (key_is_correct) {
      correct_press += 1;
   }
}

function display_session_stats(is_correct) {
   var stats, percent;
   percent = Math.round(correct_press / total_press * 100);
   stats = 'Total: ' + total_press + ', Correct: ' + percent + '%';
   if (training_options.mode === 'random_letters' ||
         training_options.mode === 'words') {
      cur_wpm = Math.round(total_press * 1000 * 60 / (Date.now() - first_key_time) / 5);
      stats += ', WPM: ' + cur_wpm;
   }
   var elem = document.getElementById('stats');
   elem.textContent = stats;
}

function set_new_text(new_text) {
   var target_box = document.getElementById('target_box');
   var cur_pos = 0;
   var cur_char;
   var letter_box;
   while (target_box.firstChild) {
          target_box.removeChild(target_box.firstChild);
   }
   while (cur_pos < new_text.length) {
      cur_char = new_text[cur_pos];
      letter_box = document.createElement('span');
      letter_box.textContent = cur_char;
      letter_box.classList.add('letterbox');
      target_box.appendChild(letter_box);
      cur_pos += 1;
   }
   target_box.parentNode.style.width = (150 * new_text.length) + 'px';
   cur_cursor = 0;
}

function locate_current_letter_span() {
   var target_box = document.getElementById('target_box');
   var children = target_box.childNodes;
   var child;
   var cur_letter_span = 0;
   var i;
   for (i = 0; i < children.length; i++) {
      child = target_box.children[i];
      if (child.nodeName.toLowerCase() === 'span') {
         if (cur_letter_span === cur_cursor) {
            return child;
         } else {
            cur_letter_span += 1;
         }
      }
   }
}

function display_hit_effect() {
   var letter_box = locate_current_letter_span();
   letter_box.style.color = 'gray';
}

function display_miss_effect() {
   var elem = document.getElementById('target_box');
   elem.classList.add('shakenow');
   setTimeout(function () {
      elem.classList.remove('shakenow');
   }, 300); // Consistent with the style duration.
}

function verify_key(char_pressed) {
   var elem = document.getElementById('target_box');
   var on_screen = get_on_screen_text();
   console.log('onscreen:' + on_screen);
   if (char_pressed !== on_screen[cur_cursor]) {
      update_session_stats(false);
      display_miss_effect();
   } else {
      if (char_pressed !== ' ') {
         update_session_stats(true);
      }
      display_hit_effect();
      cur_cursor += 1;
      if (cur_cursor >= on_screen.length) {
         elem.classList.add('hidden');
         setTimeout(function () {
            var new_char = get_new_text();
            elem.classList.remove('hidden');
            set_new_text(new_char);
            elem.classList.add('visible');
         }, 100); // Consistent with the style duration.
         display_session_stats();
      }
   }
}

function get_key_char(evt) {
   var char_pressed;
   var key_code_table = {
      188: [',', '<'],
      190: ['.', '>'],
      191: ['/', '?'],
      192: ['`', '~'],
      219: ['[', '{'],
      220: ['\\', '|'],
      221: [']', '}'],
      222: ["'", '"'],
      186: [';', ':'],
      187: ['=', '+'],
      189: ['-', '_']
   };
   var shift_num = [')', '!', '@', '#', '$', '%', '^', '&', '*', '('];
   var char_pressed = undefined;
   var log_filter = [16, 17, 18]; // ctrl, alt, shift
   if (log_filter.indexOf(evt.keyCode) === -1) {
      console.log('Key code is:' + evt.keyCode);
   } else {
      return;
   }
   if (evt.keyCode === 32) {
      char_pressed = ' ';
   } else if (evt.keyCode >= 65 && evt.keyCode <= 90) { // A-Z
      char_pressed = String.fromCharCode(evt.keyCode);
      if (!evt.shiftKey) {
         char_pressed = char_pressed.toLowerCase();
      }
   } else if (evt.keyCode >= 48 && evt.keyCode <= 57) {
      if (!evt.shiftKey) {
         char_pressed = String.fromCharCode(evt.keyCode);
      } else {
         char_pressed = shift_num[evt.keyCode - 48];
      }
   } else if (key_code_table[evt.keyCode]) {
      if (!evt.shiftKey) {
         char_pressed = key_code_table[evt.keyCode][0];
      } else {
         char_pressed = key_code_table[evt.keyCode][1];
      }
   }
   return char_pressed;
}

function restart_idle_timer() {
   if (idle_timer) {
      clearTimeout(idle_timer);
   }
   idle_timer = setTimeout(reset_session, 10000);
}

function check_key(evt) {
   var char_pressed = get_key_char(evt);
   if (!char_pressed) {
      return;
   }
   restart_idle_timer();
   console.log('char:' + char_pressed);
   if (!first_key_time) {
      first_key_time = Date.now();
   }
   verify_key(char_pressed);
}

function save_options() {
   var key, stored_value;
   for (key in training_options) {
      if (training_options.hasOwnProperty(key)) {
         window.localStorage.setItem(key, training_options[key]);
      }
   }
}

function sync_options_ui() {
   var mode_dropdown = document.getElementById('mode_selection');
   mode_dropdown.value = training_options['mode'];
   var upper_case_checkbox = document.getElementById('include_upper_case');
   upper_case_checkbox.checked = training_options['include_upper_case'];
}

function restore_options() {
   var key, stored_value;
   for (key in training_options) {
      if (training_options.hasOwnProperty(key)) {
         stored_value = window.localStorage.getItem(key);
         if (stored_value) {
            if (stored_value === 'true' || stored_value === 'false') {
               training_options[key] = (stored_value === 'true');
            } else {
               training_options[key] = stored_value;
            }
         }
      }
   }
   sync_options_ui();
}

function dump_options() {
   var key
   for (key in training_options) {
      if (training_options.hasOwnProperty(key)) {
         console.log(key + " -> " + training_options[key]);
      }
   }
}

function compute_history_stats() {
   var time_for_this_session = 0;
   if (first_key_time) {
      time_for_this_session = (Date.now() - first_key_time) / 1000;
   }
   if (cur_wpm && time_for_this_session) {
      history_stats.wpm = (history_stats.wpm * history_stats.training_time
            + cur_wpm * time_for_this_session) / (history_stats.training_time
               + time_for_this_session);
      history_stats.wpm = Math.round(history_stats.wpm);
   }
   history_stats.training_time += time_for_this_session;
   history_stats.training_time = Math.round(history_stats.training_time);
}

function save_history_stats() {
   compute_history_stats();
   window.localStorage.setItem('stats_training_time', history_stats.training_time);
   window.localStorage.setItem('stats_wpm', history_stats.wpm);
}

function load_history_stats() {
   var training_time = window.localStorage.getItem('stats_training_time');
   if (training_time) {
      history_stats.training_time = parseInt(training_time);
   }
   var wpm = window.localStorage.getItem('stats_wpm');
   if (wpm) {
      history_stats.wpm = parseInt(wpm);
   }
}

function display_history_stats() {
   var total_time_elem = document.getElementById('stats_total_time');
   var wpm_elem = document.getElementById('stats_history_wpm');
   var pad = '00';
   var hour = Math.floor(history_stats.training_time / 3600);
   hour = '' + hour;
   hour = pad.substring(0, pad.length - hour.length) + hour;
   var minute = Math.floor((history_stats.training_time % 3600) / 60);
   minute = '' + minute;
   minute = pad.substring(0, pad.length - minute.length) + minute;
   var second = history_stats.training_time % 60;
   second = '' + second;
   second = pad.substring(0, pad.length - second.length) + second;
   total_time_elem.textContent = hour + ':' + minute + ':' + second;
   wpm_elem.textContent = history_stats.wpm;
}

function reset_session() {
   save_history_stats();
   display_history_stats();
   reset_session_stats();
}

function on_options_update() {
   var mode_dropdown = document.getElementById('mode_selection');
   mode_dropdown.blur();
   training_options.mode = mode_dropdown.value;
   var upper_case_checkbox = document.getElementById('include_upper_case');
   upper_case_checkbox.blur();
   training_options['include_upper_case'] = upper_case_checkbox.checked;
   save_options();
   set_new_text(get_new_text());
   reset_session_stats();
}

function load_words(on_words_loaded) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.open('GET', 'typing_words.txt', true);
   xmlHttp.addEventListener('load', function (evt) {
      console.log('Word list is retrieved.');
      word_list = evt.target.responseText.split(' ');
      if (on_words_loaded) {
         on_words_loaded();
      }
   }, false);
   xmlHttp.send();
}

function start() {
   var mode_dropdown = document.getElementById('mode_selection');
   var upper_case_checkbox = document.getElementById('include_upper_case');

   load_history_stats();
   display_history_stats();
   restore_options();
   dump_options();
   document.addEventListener('keydown', check_key);
   mode_dropdown.addEventListener('change', on_options_update);
   upper_case_checkbox.addEventListener('change', on_options_update);
   set_new_text(get_new_text());
}

function pre_start() {
   load_words(start);
}
