
var total_press = 0;
var correct_press = 0;
var cur_cursor = 0;

function get_a_char() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";
  possible += "qwertyuiopzxcvbnm"; // Add weight to upper and lower row;
  possible += "rtyuvbnm"; // add weight to the index finger keys.
  for (var i = 0; i < 1; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
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
   stats = 'Total: ' + total_press + ', Correct: ' + percent + '%'
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
      letter_box = document.createElement('DIV');
      letter_box.textContent = cur_char;
      letter_box.classList.add('letterbox');
      target_box.appendChild(letter_box);
      cur_pos += 1;
   }
}

function display_hit_effect() {
   var new_char = get_a_char();
   var elem = document.getElementById('target_box');
   elem.classList.add('hidden');
   setTimeout(function () {
      elem.classList.remove('hidden');
      set_new_text(new_char);
      elem.classList.add('visible');
   }, 100); // Consistent with the style duration.
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
   } else {
      display_hit_effect();
      cur_cursor += 1;
      if (cur_cursor >= on_screen.length) {
         cur_cursor = 0;
      }
   }
   display_stats(char_pressed === on_screen);
}

function check_key(evt) {
   var char_pressed = String.fromCharCode(evt.keyCode);
   console.log('Keydown:' + char_pressed);
   if (char_pressed < 'A' || char_pressed > 'Z') {
      return undefined;
   }
   if (!evt.shiftKey) {
      char_pressed = char_pressed.toLowerCase();
   }
   console.log('KeyChar:' + char_pressed);
   verify_key(char_pressed);
}

function start() {
   document.addEventListener('keydown', check_key);
}

