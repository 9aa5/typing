var space_char = '\u2423';
var session_timeout_in_seconds= 5;
var total_press = 0;
var correct_press = 0;
var cur_cursor = 0;
var first_key_time = null;
var cur_wpm = 0;
var cur_accuracy = 0; // cur_accuracy / 100 is the percentage value.
var word_list;
var paragraphs;
var paragraphs_current_pointer = 0;
var idle_timer = null;
var history_stats = {
   training_time: 0,
   wpm: 0
};
var stats_rolling_period = 600;  // Last 10 minutes stats

var option_checkboxes = ['include_upper_case', 'include_space', 'include_num',
    'include_sym1', 'include_sym2'];
var option_inputboxes = ['user_specified_letters', 'background_url'];
var training_options = {
   mode: 'single_letter',  // 'user_specified_letters', 'single_letter',
                           // 'random_letters',
                           // 'words', 'sentences';
   user_specified_letters: '',       // Used on if the mode is user_specified_letters.
   include_num: false,
   include_sym1: false, // ;:'",<.>/?
   include_sym2: false, // everything else.
   include_upper_case: false,
   include_space: true,
   background_url: 'typing.jpg'
};

function reset_session_stats() {
   total_press = 0;
   correct_press = 0;
   cur_accuracy = 0;
   first_key_time = null;
   cur_cursor = 0;
}

function get_combo() {
   text = word_list[Math.floor(Math.random() * word_list.length)];
   if (training_options.include_upper_case &&
         Math.floor(Math.random() * 100) < 66) {
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

function get_a_user_specified_letter() {
   var possible = training_options.user_specified_letters;
   if (!possible.length) {
      return get_a_char();
   } else {
      return possible.charAt(Math.floor(Math.random() * possible.length));
   }
}

function get_a_sym1() {
   var possible = ';:\'\",<.>/?';
   return possible.charAt(Math.floor(Math.random() * possible.length));
}

function get_a_sym2() {
   var text;
   var possible = ';:\'\",<.>/?[]\\{}|~!@#$%^&*()_+`-=';
   return possible.charAt(Math.floor(Math.random() * possible.length));
}

function get_a_digit() {
   var text;
   var possible = '0123456789';
   return possible.charAt(Math.floor(Math.random() * possible.length));
}

function char_lr_side_on_kb(c) {
   var left='qwertasdfgzxcvb12345~!@#$%';
   if (left.indexOf(c.toLowerCase()) !== -1) {
      return 'left';
   } else {
      return 'right';
   }
}

function show_lr_indicator(prev_c) {
   var side = char_lr_side_on_kb(prev_c);
   var right_indicator = document.getElementById('right_indicator');
   var left_indicator = document.getElementById('left_indicator');
   if (side === 'right') {
      right_indicator.style.display = 'none';
      left_indicator.style.display = 'inherit';
   } else if (side === 'left') {
      left_indicator.style.display = 'none';
      right_indicator.style.display = 'inherit';
   }
}

function hide_lr_indicator() {
   var right_indicator = document.getElementById('right_indicator');
   var left_indicator = document.getElementById('left_indicator');
   left_indicator.style.display = 'none';
   right_indicator.style.display = 'none';
}

function update_lr_indicator() {
   var prev_char;
   var elem = document.getElementById('target_box');
   var on_screen = get_on_screen_text();
   if (on_screen[cur_cursor] === space_char) {
      prev_char = (cur_cursor >= 1? on_screen[cur_cursor-1]:'a');
      return show_lr_indicator(prev_char);
   }
   hide_lr_indicator();
}

function get_random_letters() {
   var i = 0, text = '';
   for (i = 0; i < 5; i ++) {
      text += get_a_char();
   }
   return text;
}

function get_next_sentence() {
   var start = paragraphs_current_pointer;
   var end = paragraphs_current_pointer + 24;
   
   while (paragraphs[end] !== space_char && end > 8) {
      end = end -1;
   }
   paragraphs_current_pointer = end;
   if (paragraphs[paragraphs_current_pointer] === space_char) {
      paragraphs_current_pointer += 1;
   }
   if (paragraphs_current_pointer >= paragraphs.length) {
      paragraphs_current_pointer = 0;
   }
   return paragraphs.substring(start, end);
}

function get_new_text() {
   var result, split_at;
   if (training_options.mode === 'user_specified_letters') {
      result = get_a_user_specified_letter();
   } else if (training_options.mode === 'single_letter') {
      result = get_a_char();
   } else if (training_options.mode === 'single_digit') {
      result = get_a_digit();
   } else if (training_options.mode === 'words') {
      result = get_combo();
   } else if (training_options.mode === 'random_letters') {
      result = get_random_letters();
   } else if (training_options.mode === 'sentences') {
      result = get_next_sentence();
   } else {
      console.log('Unknow training mode.');
   }
   if (training_options.mode === 'sentences') {
      return result;
   }
   if (training_options.include_num) {
      split_at = Math.floor(Math.random() * result.length);
      result = result.substring(0, split_at + 1) + get_a_digit() +
         result.substring(split_at + 1);
   }
   if (training_options.include_sym2) {
      split_at = Math.floor(Math.random() * result.length);
      result = result.substring(0, split_at + 1) + get_a_sym2() +
         result.substring(split_at + 1);
   } else if (training_options.include_sym1) {
      split_at = Math.floor(Math.random() * result.length);
      result = result.substring(0, split_at + 1) + get_a_sym1() +
         result.substring(split_at + 1);
   }
   if (training_options.include_space) {
      split_at = Math.floor(Math.random() * result.length);
      result = result.substring(0, split_at + 1) + space_char +
         result.substring(split_at + 1);
   }
   return result;
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

function init_session_stats_display() {
   var elem = document.getElementById('stats');
   elem.textContent = 'Starting new training session...';
}

function display_session_stats(is_correct) {
   var stats;
   cur_accuracy = Math.round(correct_press * 100 / total_press);
   stats = 'Total: ' + total_press + ', Correct: ' + cur_accuracy + '%';
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
   target_box.parentNode.style.width = ((60 * new_text.length) + 40) + 'px';
   cur_cursor = 0;
   update_lr_indicator();
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
      char_pressed = space_char;
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
   idle_timer = setTimeout(function () {
      reset_session(true);
   }, session_timeout_in_seconds * 1000);
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
   update_lr_indicator();
}

function save_options() {
   var key, stored_value;
   for (key in training_options) {
      if (training_options.hasOwnProperty(key)) {
         window.localStorage.setItem(key, training_options[key]);
      }
   }
}

function sync_options_to_ui() {
   var mode_dropdown = document.getElementById('mode_selection');
   var i = 0;
   var checkbox_elem, input_elem;
   mode_dropdown.value = training_options.mode;
   for (i = 0; i < option_inputboxes.length; i ++) {
      if (training_options[option_inputboxes[i]]) {
         input_elem = document.getElementById(option_inputboxes[i]);
         input_elem.value = training_options[option_inputboxes[i]];
      }
   }
   for (i = 0; i < option_checkboxes.length; i ++) {
      checkbox_elem = document.getElementById(option_checkboxes[i]);
      checkbox_elem.checked = training_options[option_checkboxes[i]];
   }
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
   sync_options_to_ui();
   document.documentElement.style.backgroundImage =
      'url(' + training_options.background_url + ')';
}

function dump_options() {
   var key
   for (key in training_options) {
      if (training_options.hasOwnProperty(key)) {
         console.log(key + " -> " + training_options[key]);
      }
   }
}

function compute_history_stats(is_after_timeout) {
   var time_for_this_session = 0, history_time_weight = 0;
   if (first_key_time) {
      time_for_this_session = (Date.now() - first_key_time) / 1000;
      if (is_after_timeout) {
         time_for_this_session -= session_timeout_in_seconds;
      }
   }
   if (!time_for_this_session) {
      return;
   }
   if (time_for_this_session < stats_rolling_period) {
      history_time_weight = stats_rolling_period - time_for_this_session;
   }
   if (cur_wpm && time_for_this_session) {
      history_stats.wpm = (history_stats.wpm * history_time_weight
            + cur_wpm * time_for_this_session) /
         (history_time_weight + time_for_this_session);
      history_stats.wpm = Math.round(history_stats.wpm);
   }
   if (cur_accuracy && time_for_this_session) {
      history_stats.accuracy = (history_stats.accuracy * history_time_weight
            + cur_accuracy * time_for_this_session) /
         (history_time_weight + time_for_this_session);
      history_stats.accuracy = Math.round(history_stats.accuracy);
   }
   console.log('computing stats:', 'stats_wpm', history_stats.wpm, 'stats_accuracy', history_stats.accuracy);
   history_stats.training_time += time_for_this_session;
   history_stats.training_time = Math.round(history_stats.training_time);
}

function save_history_stats(is_after_timeout) {
   compute_history_stats(is_after_timeout);
   window.localStorage.setItem('stats_training_time', history_stats.training_time);
   window.localStorage.setItem('stats_wpm', history_stats.wpm);
   window.localStorage.setItem('stats_accuracy', history_stats.accuracy);
   console.log('saving stats:', 'stats_wpm', history_stats.wpm, 'stats_accuracy', history_stats.accuracy);
}

function load_history_stats() {
   var training_time = window.localStorage.getItem('stats_training_time');
   if (training_time) {
      history_stats.training_time = parseInt(training_time);
   }
   var wpm = window.localStorage.getItem('stats_wpm');
   if (wpm) {
      history_stats.wpm = parseInt(wpm);
   } else {
      history_stats.wpm = 12;
   }
   var accuracy = window.localStorage.getItem('stats_accuracy');
   if (accuracy) {
      history_stats.accuracy = parseInt(accuracy);
   } else {
      history_stats.accuracy = 80;
   }
}

function display_history_stats() {
   var total_time_elem = document.getElementById('stats_total_time');
   var wpm_elem = document.getElementById('stats_history_wpm');
   var accuracy_elem = document.getElementById('stats_history_accuracy');
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
   accuracy_elem.textContent = history_stats.accuracy + '%'
}

function reset_session(is_after_timeout) {
   save_history_stats(is_after_timeout);
   display_history_stats();
   reset_session_stats();
   set_new_text(get_new_text());
   init_session_stats_display();
}

function on_options_update(evt) {
   var mode_dropdown = document.getElementById('mode_selection');
   var background_url_elem = document.getElementById('background_url');
   var user_letters_elem = document.getElementById('user_specified_letters');
   var need_to_reset_session = false;
   var i = 0;
   var checkbox_elems = [];
   var index;
   for (i = 0; i < option_checkboxes.length; i ++) {
      checkbox_elems.push(document.getElementById(option_checkboxes[i]));
   }
   switch (evt.target) {
   case mode_dropdown:
      training_options.mode = mode_dropdown.value;
      need_to_reset_session = true;
      break;
   case background_url_elem:
      training_options.background_url = background_url_elem.value;
      if (!training_options.background_url) {
         training_options.background_url = 'typing.jpg';
      }
      document.documentElement.style.backgroundImage =
         'url(' + training_options.background_url + ')';
      break;
   case user_letters_elem:
      training_options.user_specified_letters = user_letters_elem.value;
      need_to_reset_session = true;
      break;
   default:
      index = checkbox_elems.indexOf(evt.target);
      if (index !== -1) {
         training_options[option_checkboxes[index]] = evt.target.checked;
         need_to_reset_session = true;
      }
      break;
   }
   evt.target.blur();
   // or document.activeElement.blur();
   save_options();
   if (need_to_reset_session) {
      reset_session_stats();
      set_new_text(get_new_text());
      init_session_stats_display();
   }
}

function load_paragraphs(on_loaded) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.open('GET', 'typing_paragraph.txt', true);
   xmlHttp.addEventListener('load', function (evt) {
      console.log('Paragraphs are retrieved.');
      paragraphs = evt.target.responseText;
      paragraphs = paragraphs.replace(/\s+/g, space_char); 
      if (on_loaded) {
         on_loaded();
      }
   }, false);
   xmlHttp.send();
}

function load_words(on_loaded) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.open('GET', 'typing_words.txt', true);
   xmlHttp.addEventListener('load', function (evt) {
      console.log('Word list is retrieved.');
      word_list = evt.target.responseText.split(' ');
      load_paragraphs(on_loaded);
   }, false);
   xmlHttp.send();
}

function start() {
   var mode_dropdown = document.getElementById('mode_selection');
   var checkbox_elem, input_elem;

   load_history_stats();
   display_history_stats();
   restore_options();
   dump_options();
   document.addEventListener('keydown', check_key);
   mode_dropdown.addEventListener('change', on_options_update);
   for (i = 0; i < option_inputboxes.length; i ++) {
      input_elem = document.getElementById(option_inputboxes[i]);
      input_elem.addEventListener('change', on_options_update);
   }
   for (i = 0; i < option_checkboxes.length; i ++) {
      checkbox_elem = document.getElementById(option_checkboxes[i]);
      checkbox_elem.addEventListener('change', on_options_update);
   }
   set_new_text(get_new_text());
   init_session_stats_display();
}

function pre_start() {
   load_words(start);
}
