function showLoader() {
    DOM.loader.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function hideLoader() {
    DOM.loader.style.display = 'none';
    document.body.style.overflow = '';
}

const DOM = {
    introSection: document.getElementById('intro'),
    inputModal: document.getElementById('inputModal'),
    resultsSection: document.getElementById('results'),
    savedBooksSection: document.getElementById('savedBooks'),
    searchBtn: document.getElementById('search'),
    moreBooksBtn: document.getElementById('more-books-btn'),
    restartBtn: document.getElementById('restart-btn'),
    titleInput: document.getElementById('titleInput'),
    titleSearchBtn: document.getElementById('titleSearchBtn'),
    loader: document.getElementById('loader'),
    bookResults: document.getElementById('bookResults'),
    savedBooksContainer: document.getElementById('savedBooksContainer'),
    navLinks: document.querySelectorAll('.nav-link')
};

const keywordMap = {
    romance: 'love OR romance OR uplifting',
    mystery: 'mystery OR thriller OR suspense',
    philosophy: 'life OR philosophy OR introspection',
    fantasy: 'fantasy OR magic OR adventure',
    nonfiction: 'non-fiction OR true story OR biography',
    detective: 'detective OR crime OR investigation',
    dystopia: 'dystopia OR rebellion OR society',
    fantasy_character: 'wizard OR chosen one OR fantasy hero',
    literature: 'philosopher OR thinker OR classic literature',
    science: 'inventor OR science OR tech innovator',
    fairy_tale: 'fairy tale OR enchanted kingdom',
    crime: 'city OR noir OR gritty',
    'sci-fi': 'space OR future OR sci-fi',
    nature: 'countryside OR nature OR wilderness',
    coming_of_age: 'school OR campus OR coming of age'
};

function toggleSection(targetId) {
    const sections = [DOM.introSection, DOM.inputModal, DOM.resultsSection, DOM.savedBooksSection];
    sections.forEach(section => {
        section.classList.toggle('visible', section.id === targetId);
        section.classList.toggle('hidden', section.id !== targetId);
    });

    DOM.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
    });

    if (targetId === 'savedBooks') showSavedBooks();
}

async function fetchBookDescription(key) {
    try {
        const res = await fetch(`https://openlibrary.org${key}.json`);
        const data = await res.json();
        return typeof data.description === 'string'
            ? data.description
            : data.description?.value || 'No description available.';
    } catch {
        return 'No description available.';
    }
}

async function shareBook(book) {
    const shareData = {
        title: book.title || 'Book Recommendation',
        text: `${book.title} by ${book.author || 'Unknown'} - Check out this book!`,
        url: `https://openlibrary.org${book.key}`
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.url);
            await Swal.fire({
                icon: 'success',
                title: 'Link Copied!',
                text: 'Link copied to clipboard: ' + shareData.url,
                confirmButtonColor: '#1a3d2e',
                confirmButtonText: 'OK'
            });
        }
    } catch (err) {
        console.error('Share failed:', err);
        await navigator.clipboard.writeText(shareData.url);
        alert('Failed to share. Link copied to clipboard: ' + shareData.url);
    }
}

function createBookCard(book, isSaved = false) {
    const title = book.title || 'No title';
    const author = book.author || book.author_name?.[0] || 'Unknown';
    const coverId = book.cover_i || book.covers?.[0];
    const coverURL = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : 'https://via.placeholder.com/150x200?text=No+Cover';
    const key = book.key || '';

    return `
        <div class="book-card" data-key="${key}">
            <img src="${coverURL}" alt="${title}" class="book-cover">
            <div class="book-title">${title}</div>
            <div class="book-author">${author}</div>
            <div class="book-details">
                <h3>${title}</h3>
                <p class="book-author">${author}</p>
                <p class="book-description">${book.description || 'No description available.'}</p>
                <div class="book-actions">
                    <button class="${isSaved ? 'remove-book' : 'save-book'}" data-key="${key}">
                        ${isSaved ? 'Remove' : 'Save'}
                    </button>
                    <button class="share-btn" data-title="${title}" data-author="${author}" data-key="${key}">
                        Share
                    </button>
                </div>
            </div>
        </div>`;
}

function addBookCardListeners(container) {
    container.querySelectorAll('.save-book').forEach(button => {
        button.addEventListener('click', () => {
            const key = button.dataset.key;
            const saved = JSON.parse(localStorage.getItem('savedBooks') || '[]');
            if (!saved.includes(key)) {
                saved.push(key);
                localStorage.setItem('savedBooks', JSON.stringify(saved));
                button.textContent = 'Saved';
                button.disabled = true;
            }
        });
    });

    container.querySelectorAll('.remove-book').forEach(button => {
        button.addEventListener('click', () => {
            const key = button.dataset.key;
            const saved = JSON.parse(localStorage.getItem('savedBooks') || '[]')
                .filter(bookKey => bookKey !== key);
            localStorage.setItem('savedBooks', JSON.stringify(saved));
            showSavedBooks();
        });
    });

    container.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', () => shareBook({
            title: button.dataset.title,
            author: button.dataset.author,
            key: button.dataset.key
        }));
    });
}

async function fetchBooks(query, limit = 6) {
    try {
        showLoader();
        DOM.bookResults.innerHTML = '<p>Loading books...</p>';

        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
        const data = await res.json();
        const books = data.docs || [];

        if (!books.length) {
            DOM.bookResults.innerHTML = `<p>No books found for "${query}". Try different preferences.</p>`;
            hideLoader();
            return [];
        }

        const fullBooks = await Promise.all(books.map(async book => {
            book.description = await fetchBookDescription(book.key);
            return book;
        }));

        hideLoader();
        return fullBooks;
    } catch (err) {
        DOM.bookResults.innerHTML = `<p>Error: ${err.message}</p>`;
        hideLoader();
        return [];
    }
}

function getRandomPreferences() {
    const keys = Object.keys(keywordMap);
    const randomPrefs = new Set();
    while (randomPrefs.size < 3) {
        const rand = keys[Math.floor(Math.random() * keys.length)];
        randomPrefs.add(rand);
    }
    return Array.from(randomPrefs);
}

async function searchByPreferences(generateMore = false) {
    let selectedValues;
    const selects = document.querySelectorAll('#book-picker-form select');

    if (generateMore) {
        selectedValues = getRandomPreferences();
        selectedValues.forEach((val, idx) => {
            if (selects[idx]) selects[idx].value = val;
        });
    } else {
        selectedValues = Array.from(selects).map(select => select.value);
    }

    const keywords = selectedValues.map(val => keywordMap[val] || '').filter(Boolean);
    if (keywords.length < 3) keywords.push('fiction', 'bestseller');

    const query = keywords.join(' ');

    DOM.bookResults.innerHTML = '';
    toggleSection('results');

    const books = await fetchBooks(query);
    if (books.length) {
        DOM.bookResults.innerHTML = books.map(book => createBookCard(book)).join('');
        addBookCardListeners(DOM.bookResults);
    } else {
        DOM.bookResults.innerHTML = `<p>🧸 Sorry! No books matched your vibe. Try different answers or use the Search tab.</p>`;
    }
}

async function searchByTitle() {
    const query = DOM.titleInput.value.trim();
    if (!query) {
        await Swal.fire({
            icon: 'warning',
            title: 'Missing Input',
            text: 'Please enter a book title or author.',
            confirmButtonColor: '#1a3d2e',
            confirmButtonText: 'OK'
        });
        return;
    }

    DOM.bookResults.innerHTML = '';
    toggleSection('results');

    const books = await fetchBooks(query, 8);
    if (books.length) {
        DOM.bookResults.innerHTML = books.map(book => createBookCard(book)).join('');
        addBookCardListeners(DOM.bookResults);
    }
}

async function showSavedBooks() {
    const saved = JSON.parse(localStorage.getItem('savedBooks') || '[]');
    DOM.savedBooksContainer.innerHTML = saved.length ? '' : '<p>No saved books yet.</p>';

    if (saved.length) {
        try {
            const books = await Promise.all(saved.map(async key => {
                const res = await fetch(`https://openlibrary.org${key}.json`);
                const book = await res.json();
                book.key = key;
                book.description = await fetchBookDescription(key);
                return book;
            }));

            DOM.savedBooksContainer.innerHTML = books.map(book => createBookCard(book, true)).join('');
            addBookCardListeners(DOM.savedBooksContainer);
        } catch {
            DOM.savedBooksContainer.innerHTML = '<p>Failed to load saved books.</p>';
        }
    }
}

function enableMobileCardToggle() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', function (e) {
                if (e.target.closest('.book-details')) return;
                document.querySelectorAll('.book-card.show-details').forEach(openCard => {
                    if (openCard !== card) openCard.classList.remove('show-details');
                });
                card.classList.toggle('show-details');
            });
        });
    }
}

function initEventListeners() {
    DOM.searchBtn.addEventListener('click', e => {
        e.preventDefault();
        searchByPreferences();
    });

    DOM.moreBooksBtn.addEventListener('click', e => {
        e.preventDefault();
        searchByPreferences(true);
    });

    DOM.titleSearchBtn.addEventListener('click', e => {
        e.preventDefault();
        searchByTitle();
    });

    DOM.titleInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchByTitle();
        }
    });

    DOM.navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            toggleSection(target);
        });
    });

    const pickerBtn = document.getElementById('book-picker-btn');
    if (pickerBtn) {
        pickerBtn.addEventListener('click', e => {
            e.preventDefault();
            toggleSection('inputModal');
        });
    }

    const backBtn = document.getElementById('back-to-picker-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => toggleSection('inputModal'));
    }

    if (DOM.restartBtn) {
        DOM.restartBtn.addEventListener('click', () => toggleSection('intro'));
    }

    // Mobile Nav Toggle
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !expanded);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    enableMobileCardToggle();
});
