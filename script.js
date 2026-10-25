const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const message = document.getElementById("message");
const results = document.getElementById("results");
const savedList = document.getElementById("saved-list");
const themeBtn = document.getElementById("theme-btn");

let savedWords = [];

// search when the form is submitted
form.addEventListener("submit", function (event) {
  event.preventDefault();
  searchWord(input.value);
});

function searchWord(word) {
  word = word.trim().toLowerCase();

  if (word === "") {
    message.textContent = "Please enter a word.";
    results.innerHTML = "";
    return;
  }

  fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Word not found");
      }
      return response.json();
    })
    .then(function (data) {
      message.textContent = "";
      showWord(data[0]);
    })
    .catch(function (error) {
      results.innerHTML = "";
      if (error.message === "Word not found") {
        message.textContent = "Sorry, we could not find that word.";
      } else {
        message.textContent = "Something went wrong. Check your internet and try again.";
      }
    });
}

function showWord(entry) {
  const card = document.createElement("div");
  card.className = "word-card";

  if (savedWords.includes(entry.word)) {
    card.classList.add("saved");
  }

  // word and pronunciation
  let html = "<h2>" + entry.word + "</h2>";
  if (entry.phonetic) {
    html += "<p>Pronunciation: " + entry.phonetic + "</p>";
  } else {
    html += "<p>Pronunciation not available.</p>";
  }

  // audio
  let audioUrl = "";
  for (let i = 0; i < entry.phonetics.length; i++) {
    if (entry.phonetics[i].audio) {
      audioUrl = entry.phonetics[i].audio;
      break;
    }
  }
  if (audioUrl) {
    html += '<audio controls src="' + audioUrl + '" aria-label="Pronunciation audio"></audio>';
  } else {
    html += "<p>Audio not available.</p>";
  }

  // meanings: part of speech, definition, example
  let synonyms = [];
  entry.meanings.forEach(function (meaning) {
    html += "<h3>" + meaning.partOfSpeech + "</h3>";
    const def = meaning.definitions[0];
    html += "<p>" + def.definition + "</p>";
    if (def.example) {
      html += '<p class="example">Example: ' + def.example + "</p>";
    }
    synonyms = synonyms.concat(meaning.synonyms);
  });

  // synonyms
  if (synonyms.length > 0) {
    html += "<p>Synonyms: " + synonyms.slice(0, 5).join(", ") + "</p>";
  } else {
    html += "<p>No synonyms available.</p>";
  }

  // source
  if (entry.sourceUrls && entry.sourceUrls.length > 0) {
    html += '<p>Source: <a href="' + entry.sourceUrls[0] + '" target="_blank">' + entry.sourceUrls[0] + "</a></p>";
  }

  card.innerHTML = html;

  // save button
  const saveBtn = document.createElement("button");
  saveBtn.textContent = savedWords.includes(entry.word) ? "Unsave" : "Save word";
  saveBtn.setAttribute("aria-label", "Save " + entry.word);
  saveBtn.addEventListener("click", function () {
    saveWord(entry.word, card, saveBtn);
  });
  card.appendChild(saveBtn);

  results.innerHTML = "";
  results.appendChild(card);
}

function saveWord(word, card, button) {
  if (savedWords.includes(word)) {
    savedWords = savedWords.filter(function (w) {
      return w !== word;
    });
    card.classList.remove("saved");
    button.textContent = "Save word";
  } else {
    savedWords.push(word);
    card.classList.add("saved");
    button.textContent = "Unsave";
  }
  showSavedWords();
}

function showSavedWords() {
  savedList.innerHTML = "";
  savedWords.forEach(function (word) {
    const li = document.createElement("li");
    li.textContent = word;
    li.addEventListener("click", function () {
      input.value = word;
      searchWord(word);
    });
    savedList.appendChild(li);
  });
}

// theme toggle
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "Light mode";
  } else {
    themeBtn.textContent = "Dark mode";
  }
});