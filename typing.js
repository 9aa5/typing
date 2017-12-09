
var total_press = 0;
var correct_press = 0;
var cur_cursor = 0;
var word_typing_correct = true;
var penalty_displayed = false;
var first_key_time = null;
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

function reset_stats() {
   total_press = 0;
   correct_press = 0;
   first_key_time = null;
   cur_cursor = 0;
}

function get_combo() {
   var possible = ['of', 'to', 'in', 'it', 'is', 'be', 'as', 'at', 'so', 'we',
       'he', 'by', 'or', 'on', 'do', 'if', 'me', 'my', 'up', 'an', 'go', 'no',
       'us', 'am', 'ox'];
   possible = possible.concat([
         'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any',
         'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has',
         'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way',
         'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
         'zoo', 'joy'
      ]);
   possible = possible.concat([
         'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they',
         'know', 'want', 'been', 'good', 'much', 'some', 'time', 'query',
         'zest'
      ]);
   text = possible[Math.floor(Math.random() * possible.length)];
   if (training_options.include_upper_case &&
         Math.floor(Math.random() * 100) < 33) {
      text = text[0].toUpperCase() + text.slice(1);
   }
   return text;
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

function display_stats(is_correct) {
   var stats, percent;
   total_press += 1;
   if (is_correct) {
      correct_press += 1;
   }
   percent = Math.round(correct_press / total_press * 100);
   stats = 'Total: ' + total_press + ', Correct: ' + percent + '%';
   if (training_options.mode === 'random_letters') {
      stats += ', WPM: ' + Math.round(
            total_press * 1000 * 60 / (Date.now() - first_key_time));
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
      display_miss_effect();
      word_typing_correct = false;
         // Display penalty immediately.
      if (!penalty_displayed) {
         display_stats(false);
         penalty_displayed = true;
      }
   } else {
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
         if (word_typing_correct) {
            display_stats(word_typing_correct);
         }
         word_typing_correct = true;
         penalty_displayed = false;
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
function check_key(evt) {
   var char_pressed = get_key_char(evt);
   if (!char_pressed) {
      return;
   }
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

function on_options_update() {
   var mode_dropdown = document.getElementById('mode_selection');
   mode_dropdown.blur();
   training_options.mode = mode_dropdown.value;
   var upper_case_checkbox = document.getElementById('include_upper_case');
   upper_case_checkbox.blur();
   training_options['include_upper_case'] = upper_case_checkbox.checked;
   save_options();
   set_new_text(get_new_text());
   reset_stats();
}


function start() {
   var mode_dropdown = document.getElementById('mode_selection');
   var upper_case_checkbox = document.getElementById('include_upper_case');

   restore_options();
   dump_options();
   document.addEventListener('keydown', check_key);
   mode_dropdown.addEventListener('change', on_options_update);
   upper_case_checkbox.addEventListener('change', on_options_update);
   set_new_text(get_new_text());
}
