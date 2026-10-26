cat > README.md <<'EOF'
# Wordly - Dictionary App

Wordly is a simple single page application that lets a user search for an English word and see its details without reloading the page. It uses HTML, CSS and JavaScript, and gets its data from the [Free Dictionary API](https://dictionaryapi.dev/).

## Features
- Search for a word using a form
- Shows the definition, part of speech and an example
- Shows synonyms and the pronunciation
- Audio button to hear the pronunciation
- Shows an error message if the word is not found, the input is empty, or the API request fails
- Shows a fallback message when a word has no synonyms or audio

## How to Run
1. Clone the repository:
   `git clone git@github.com:shalomwambui1-maker/myProject.git`
2. Open `index.html` in your browser.

## Files
- `index.html` - page structure
- `style.css` - styling
- `script.js` - fetches data from the API and updates the page

## Author
Shalom Wambui Githaiga
EOF

git add README.md
git commit -m "Add README"
git push