
var total_press = 0;
var correct_press = 0;
var cur_cursor = 0;
var word_typing_correct = true;
var penalty_displayed = false;
function get_combo() {
   var possible = ['of', 'to', 'in', 'it', 'is', 'be', 'as', 'at', 'so', 'we',
       'he', 'by', 'or', 'on', 'do', 'if', 'me', 'my', 'up', 'an', 'go', 'no',
       'us', 'am'];
   possible = possible.concat([
         'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any',
         'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has',
         'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way',
         'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
      ]);
   possible = possible.concat([
         'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they',
         'know', 'want', 'been', 'good', 'much', 'some', 'time'
      ]);
   text = possible[Math.floor(Math.random() * possible.length)];
   return text;
}

function get_new_text() {
   var train_single_letter = document.getElementById('train_single_letter').checked;
   if (train_single_letter) {
      return get_a_char();
   } else {
      return get_combo();
   }
}

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
      letter_box = document.createElement('span');
      letter_box.textContent = cur_char;
      letter_box.classList.add('letterbox');
      target_box.appendChild(letter_box);
      cur_pos += 1;
   }
   target_box.parentNode.style.width = (150 * new_text.length) + 'px';
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
         cur_cursor = 0;
         if (word_typing_correct) {
            display_stats(word_typing_correct);
         }
         word_typing_correct = true;
         penalty_displayed = false;
      }
   }
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

