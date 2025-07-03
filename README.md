# 🐻 Bear Tales — Forest-Themed Book Recommendation Web App

**Bear Tales** is a beautifully animated, forest-themed web app that helps you discover your next favorite book — whether you're looking for a magical escape, a deep introspective read, or a thrilling detective story.

Built with vanilla JavaScript, HTML, and CSS, the app uses the [Open Library API](https://openlibrary.org/developers/api) to recommend books based on your **mood**, **preferred character**, and **dream setting** — or even by searching directly by title or author.

> “Not all those who wander are lost — especially in the forest of books.” 🌲📚

---

## ✨ Live Preview

🌐 [Try the app here →](https://eshaalb.github.io/Bear-Tales)

---

 
## 🔍 Key Features

### 🎯 Smart Book Picker
Select your **vibe**, **character type**, and **setting** — and the app builds an intelligent query to fetch great book matches from Open Library.

### 🔎 Title/Author Search
Manually search for any book using a direct title or author name. Great for exploring specific interests.

### 💾 Save to Favorites
Save any book to your local "Saved Books" shelf. It uses `localStorage` so your books stay even after refreshing.

### 📤 Share or Copy Link
Use the **Share** button to share a book with friends. On unsupported devices, the app will smartly copy the book link to your clipboard.

### ⏳ Animated Loader
A custom SVG loader displays while books are being fetched — keeping the user informed and engaged.

### 🧸 Adorable Bear Theme
Animated bear graphics, floating leaves, wooden textures, and relaxing jungle vibes.

---

## 🧠 How It Works

1. You either:
   - Answer three mood-based questions, or
   - Search by title/author.
2. Your inputs are converted into **search keywords**.
3. The app uses those keywords to query the [Open Library API](https://openlibrary.org/dev/docs/api/search).
4. It fetches matching books, gets additional details (like description), and displays them as cards.
5. You can save or share any book instantly!

---

## 🚀 Technologies Used

| Tech             | Purpose                                |
|------------------|----------------------------------------|
| HTML5 / CSS3     | Core structure and custom styling      |
| JavaScript (ES6) | App logic and interactivity            |
| Open Library API | Real-time book data                    |
| SweetAlert2      | Polished alert messages                |
| SVG Animation    | Smooth custom loading experience       |

---
 
