const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

const form = document.getElementById('search-form');
const input = document.getElementById('word-input');
const results = document.getElementById('results');
const errorBox = document.getElementById('error');
const loading = document.getElementById('loading');
const savedList = document.getElementById('saved-list');
const savedEmpty = document.getElementById('saved-empty');
const themeToggle = document.getElementById('theme-toggle');

let savedWords = [];
try {
  savedWords = JSON.parse(localStorage.getItem('wordlySaved') || '[]');
} catch {
  savedWords = [];
}

function persistSaved() {
  try { localStorage.setItem('wordlySaved', JSON.stringify(savedWords)); } catch {}
}

function showError(message) {
  results.innerHTML = '';
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function renderSaved() {
  savedList.innerHTML = '';
  savedEmpty.classList.toggle('hidden', savedWords.length > 0);

  savedWords.forEach((word) => {
    const li = document.createElement('li');

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'saved-word';
    open.textContent = word;
    open.setAttribute('aria-label', `Search saved word ${word}`);
    open.addEventListener('click', () => searchWord(word));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${word} from saved words`);
    remove.addEventListener('click', () => {
      savedWords = savedWords.filter((w) => w !== word);
      persistSaved();
      renderSaved();
      document.querySelectorAll('.card').forEach((card) => {
        if (card.dataset.word === word) {
          card.classList.remove('saved');
          const btn = card.querySelector('.save-btn');
          if (btn) btn.textContent = '☆ Save';
        }
      });
    });

    li.append(open, remove);
    savedList.appendChild(li);
  });
}

function toggleSave(word, card, button) {
  if (savedWords.includes(word)) {
    savedWords = savedWords.filter((w) => w !== word);
  } else {
    savedWords.push(word);
  }
  persistSaved();
  renderSaved();
  const isSaved = savedWords.includes(word);
  card.classList.toggle('saved', isSaved);
  button.textContent = isSaved ? '★ Saved' : '☆ Save';
  button.setAttribute('aria-pressed', String(isSaved));
}

function collectSynonyms(entry) {
  const set = new Set();
  entry.meanings.forEach((meaning) => {
    (meaning.synonyms || []).forEach((s) => set.add(s));
    meaning.definitions.forEach((d) => (d.synonyms || []).forEach((s) => set.add(s)));
  });
  return [...set];
}

function renderEntry(entry) {
  const word = entry.word;
  const isSaved = savedWords.includes(word);

  const card = document.createElement('article');
  card.className = 'card' + (isSaved ? ' saved' : '');
  card.dataset.word = word;
  card.setAttribute('aria-label', `Definition of ${word}`);

  // Header: word + save button
  const head = document.createElement('div');
  head.className = 'card-head';
  const title = document.createElement('h2');
  title.textContent = word;
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'save-btn';
  saveBtn.textContent = isSaved ? '★ Saved' : '☆ Save';
  saveBtn.setAttribute('aria-label', `Save ${word} to favorites`);
  saveBtn.setAttribute('aria-pressed', String(isSaved));
  saveBtn.addEventListener('click', () => toggleSave(word, card, saveBtn));
  head.append(title, saveBtn);
  card.appendChild(head);

  // Pronunciation text (with fallback)
  const phoneticText = entry.phonetic || (entry.phonetics || []).find((p) => p.text)?.text;
  const phonetic = document.createElement('p');
  phonetic.className = phoneticText ? 'phonetic' : 'muted';
  phonetic.textContent = phoneticText || 'Pronunciation not available.';
  card.appendChild(phonetic);

  // Audio playback (with fallback)
  const audioSrc = (entry.phonetics || []).find((p) => p.audio)?.audio;
  if (audioSrc) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = audioSrc.startsWith('//') ? `https:${audioSrc}` : audioSrc;
    audio.setAttribute('aria-label', `Pronunciation audio for ${word}`);
    card.appendChild(audio);
  } else {
    const noAudio = document.createElement('p');
    noAudio.className = 'muted';
    noAudio.textContent = 'Audio pronunciation not available.';
    card.appendChild(noAudio);
  }

  // Meanings
  entry.meanings.forEach((meaning) => {
    const pos = document.createElement('h3');
    pos.className = 'pos';
    pos.textContent = meaning.partOfSpeech;
    card.appendChild(pos);

    const list = document.createElement('ol');
    list.className = 'defs';
    meaning.definitions.forEach((def) => {
      const li = document.createElement('li');
      li.textContent = def.definition;
      if (def.example) {
        const ex = document.createElement('div');
        ex.className = 'example';
        ex.textContent = `"${def.example}"`;
        li.appendChild(ex);
      }
      list.appendChild(li);
    });
    card.appendChild(list);
  });

  // Synonyms (with fallback)
  const synonyms = collectSynonyms(entry);
  const synBox = document.createElement('div');
  synBox.className = 'synonyms';
  const synLabel = document.createElement('strong');
  synLabel.textContent = 'Synonyms: ';
  synBox.appendChild(synLabel);
  if (synonyms.length) {
    synonyms.forEach((syn) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = syn;
      chip.setAttribute('aria-label', `Search synonym ${syn}`);
      chip.addEventListener('click', () => searchWord(syn));
      synBox.appendChild(chip);
    });
  } else {
    const none = document.createElement('span');
    none.className = 'muted';
    none.textContent = 'No synonyms available for this word.';
    synBox.appendChild(none);
  }
  card.appendChild(synBox);

  // Source details
  if (entry.sourceUrls && entry.sourceUrls.length) {
    const source = document.createElement('p');
    source.className = 'source';
    source.append('Source: ');
    const link = document.createElement('a');
    link.href = entry.sourceUrls[0];
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = entry.sourceUrls[0];
    source.appendChild(link);
    if (entry.license && entry.license.name) {
      source.append(` (${entry.license.name})`);
    }
    card.appendChild(source);
  }

  results.appendChild(card);
}

async function searchWord(rawWord) {
  const word = rawWord.trim().toLowerCase();

  if (!word) {
    showError('Please enter a word to search.');
    return;
  }
  if (!/^[a-z'\- ]+$/i.test(word)) {
    showError('Please enter a valid word using letters only.');
    return;
  }

  input.value = word;
  clearError();
  results.innerHTML = '';
  loading.classList.remove('hidden');

  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(word)}`);
    if (response.status === 404) {
      throw new Error(`Sorry, no definitions found for "${word}". Check the spelling and try again.`);
    }
    if (!response.ok) {
      throw new Error(`The dictionary service returned an error (status ${response.status}). Please try again.`);
    }
    const data = await response.json();
    results.innerHTML = '';
    data.forEach(renderEntry);
  } catch (error) {
    const isNetwork = error instanceof TypeError;
    showError(isNetwork ? 'Network error. Check your internet connection and try again.' : error.message);
  } finally {
    loading.classList.add('hidden');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  searchWord(input.value);
});

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️ Light mode' : '🌙 Dark mode';
  try { localStorage.setItem('wordlyDark', String(dark)); } catch {}
}

themeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

let startDark = false;
try { startDark = localStorage.getItem('wordlyDark') === 'true'; } catch {}
applyTheme(startDark);
renderSaved();