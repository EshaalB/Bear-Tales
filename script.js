// Book Search Application
class BookSearchApp {
    // DOM Elements
    static DOM = {
        introSection: document.getElementById('intro'),
        inputModal: document.getElementById('inputModal'),
        resultsSection: document.getElementById('results'),
        savedBooksSection: document.getElementById('savedBooks'),
        searchBtn: document.getElementById('search'),
        moreBooksBtn: document.getElementById('more-books-btn'),
        titleInput: document.getElementById('titleInput'),
        titleSearchBtn: document.getElementById('titleSearchBtn'),
        loader: document.getElementById('loader'),
        bookResults: document.getElementById('bookResults'),
        savedBooksContainer: document.getElementById('savedBooksContainer'),
        navLinks: document.querySelectorAll('.nav-link'),
        hamburgerBtn: document.getElementById('hamburger-btn'),
        navLinksContainer: document.getElementById('nav-links'),
        bookPickerBtn: document.getElementById('book-picker-btn'),
        backToPickerBtn: document.getElementById('back-to-picker-btn'),
        bookPickerForm: document.getElementById('book-picker-form')
    };

    // Keyword mapping for book preferences
    static keywordMap = {
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

    // Sample book data for demonstration
    static sampleBooks = [
        {
            title: "The Jungle Book",
            author: "Rudyard Kipling",
            key: "/works/OL82539W",
            description: "The story of Mowgli, a boy raised by wolves in the Indian jungle.",
            cover_i: 840678
        },
        // ... other sample books (omitted for brevity)
    ];

    // UI Management
    static showLoader() {
        this.DOM.loader.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    static hideLoader() {
        this.DOM.loader.style.display = 'none';
        document.body.style.overflow = '';
    }

    static toggleSection(targetId) {
        const sections = [
            this.DOM.introSection,
            this.DOM.inputModal,
            this.DOM.resultsSection,
            this.DOM.savedBooksSection
        ];

        sections.forEach(section => {
            if (!section) return;
            section.classList.toggle('visible', section.id === targetId);
            section.classList.toggle('hidden', section.id !== targetId);
        });

        this.DOM.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
        });

        if (window.innerWidth <= 768) {
            this.DOM.hamburgerBtn.classList.remove('open');
            this.DOM.navLinksContainer.classList.remove('open');
        }

        if (targetId === 'savedBooks') this.showSavedBooks();
    }

    // Book Card Creation

    static createBookCard(book, isSaved = false) {
        const title = book.title || 'No title';
        const author = book.author || book.author_name?.[0] || 'Unknown';
        const coverId = book.cover_i || book.covers?.[0];
        const coverURL = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : 'https://via.placeholder.com/150x200?text=No+Cover';
        const key = book.key || '';
        const description = book.description || 'No description available.';
        const isLong = description.length > 220;

        return `
        <div class="book-card" data-key="${key}">
            <img src="${coverURL}" alt="${title}" class="book-cover" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover';">
            <div class="book-title">${title}</div>
            <div class="book-author">${author}</div>
            <div class="book-details">
                <h3>${title}</h3>
                <p class="book-author">${author}</p>
               <p class="book-description${isLong ? '' : ' expanded'}" data-full="${description.replace(/"/g, '&quot;')}">
    ${isLong ? description.slice(0, 220) + '...' : description}
</p>
                ${isLong ? `<button class="read-more-btn" type="button">Read more</button>` : ''}
                <div class="book-actions">
                    <button class="${isSaved ? 'remove-book' : 'save-book'}${isSaved ? ' saved' : ''}" data-key="${key}">
                        <i class="fas ${isSaved ? 'fa-trash' : 'fa-bookmark'}"></i> ${isSaved ? 'Remove' : 'Save'}
                    </button>
                    <button class="share-btn" data-title="${title}" data-author="${author}" data-key="${key}">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        </div>`;
    }


    // Book Card Event Listeners
    static addBookCardListeners(container) {
        if (!container) return;

        container.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', function (e) {
                if (e.target.closest('button')) return;
                this.classList.toggle('show-details');
            });
        });

        container.querySelectorAll('.save-book').forEach(button => {
            button.addEventListener('click', () => this.saveBook(button));
        });

        container.querySelectorAll('.remove-book').forEach(button => {
            button.addEventListener('click', () => this.removeBook(button));
        });

        container.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', () => this.shareBook(button));
        });
        // ...existing code...
        container.querySelectorAll('.read-more-btn').forEach(button => {
            button.addEventListener('click', function () {
                const desc = this.parentElement.querySelector('.book-description');
                if (desc.classList.contains('expanded')) {
                    desc.classList.remove('expanded');
                    desc.innerText = desc.dataset.short || desc.innerText;
                    this.innerText = 'Read more';
                } else {
                    desc.classList.add('expanded');
                    if (!desc.dataset.short) desc.dataset.short = desc.innerText;
                    desc.innerText = desc.dataset.full || this.parentElement.bookFullDescription;
                    if (!desc.dataset.full) {
                        // Get the full description from the card's dataset or fallback
                        const full = this.parentElement.bookFullDescription || desc.dataset.short;
                        desc.dataset.full = full;
                        desc.innerText = full;
                    }
                    this.innerText = 'Show less';
                }
            });
        });
        // ...existing code...
    }

    static saveBook(button) {
        const card = button.closest('.book-card');
        const key = button.dataset.key;
        const book = {
            key,
            title: card.querySelector('.book-title').textContent,
            author: card.querySelector('.book-author').textContent,
            description: card.querySelector('.book-description').textContent,
            cover_i: card.querySelector('img').src.match(/\/b\/id\/(\d+)-M\.jpg/)?.[1] || null
        };

        const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        if (!savedBooks.find(b => b.key === key)) {
            savedBooks.push(book);
            localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
            Swal.fire({
                title: 'Saved!',
                text: 'Book added to your favorites.',
                icon: 'success',
                confirmButtonColor: '#14532d',
                confirmButtonText: 'Got it 🐻'
            });
            button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
            button.classList.add('saved');
        } else {
            Swal.fire({
                title: 'Already Saved!',
                text: 'This book is already in your saved list.',
                icon: 'info',
                confirmButtonColor: '#14532d',
                confirmButtonText: 'Okay'
            });
        }
    }

    static removeBook(button) {
        const key = button.dataset.key;
        const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || [])
            .filter(book => book.key !== key);
        localStorage.setItem('savedBooks', JSON.stringify(savedBooks));

        Swal.fire({
            title: 'Removed!',
            text: 'Book removed from your saved list.',
            icon: 'info',
            confirmButtonColor: '#14532d',
            confirmButtonText: 'Okay'
        }).then(() => {
            this.showSavedBooks();
        });
    }

    static shareBook(button) {
        const { title, author } = button.dataset;
        if (navigator.share) {
            navigator.share({
                title: `Book Recommendation: ${title}`,
                text: `Check out "${title}" by ${author} on Bear Tales!`,
                url: window.location.href
            }).catch(err => console.error('Share error:', err));
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = `Check out "${title}" by ${author} on Bear Tales!`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            Swal.fire({
                title: 'Copied!',
                text: 'Book information copied to clipboard!',
                icon: 'success',
                confirmButtonColor: '#14532d'
            });
        }
    }

    // Display Saved Books
    static showSavedBooks() {
        const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        this.DOM.savedBooksContainer.innerHTML = savedBooks.length
            ? savedBooks.map(book => this.createBookCard(book, true)).join('')
            : '<p class="no-books">No saved books yet. Start exploring to find books to save!</p>';
        this.addBookCardListeners(this.DOM.savedBooksContainer);
    }

    // API Calls

    static async fetchBooks(query, limit = 10) {
        this.showLoader();
        this.DOM.bookResults.innerHTML = '';

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (data.docs?.length) {
                // Fetch descriptions for each book using the works API
                const books = await Promise.all(
                    data.docs.slice(0, limit).map(async book => {
                        let description = 'No description available.';
                        // Try to fetch the work details for a description
                        if (book.key) {
                            try {
                                const workRes = await fetch(`https://openlibrary.org${book.key}.json`);
                                if (workRes.ok) {
                                    const workData = await workRes.json();
                                    if (typeof workData.description === 'string') {
                                        description = workData.description;
                                    } else if (typeof workData.description === 'object' && workData.description?.value) {
                                        description = workData.description.value;
                                    }
                                }
                            } catch (e) {
                                // Ignore errors, fallback to default description
                            }
                        }
                        // Fallbacks if no description found
                        if (description === 'No description available.' && book.first_sentence) {
                            description = Array.isArray(book.first_sentence)
                                ? book.first_sentence[0]
                                : book.first_sentence;
                        } else if (description === 'No description available.' && book.subjects) {
                            description = book.subjects.slice(0, 3).join(', ');
                        }

                        return {
                            title: book.title,
                            author: book.author_name?.[0] || 'Unknown',
                            key: book.key,
                            description,
                            cover_i: book.cover_i
                        };
                    })
                );

                this.DOM.bookResults.innerHTML = books.map(book => this.createBookCard(book)).join('');
                this.addBookCardListeners(this.DOM.bookResults);
            } else {
                this.DOM.bookResults.innerHTML = `<p class="no-results">No books found for "${query}". Try different preferences.</p>`;
            }
        } catch (err) {
            console.error('API Error:', err);
            this.DOM.bookResults.innerHTML = '<p class="no-results">Error fetching books. Please try again.</p>';
        } finally {
            this.hideLoader();
        }
    }


    // Search Functions
    static searchByPreferences() {
        const q1 = document.getElementById('q1')?.value;
        const q2 = document.getElementById('q2')?.value;
        const q3 = document.getElementById('q3')?.value;

        if (!q1 || !q2 || !q3) {
            Swal.fire({
                title: 'Incomplete Input',
                text: 'Please answer all three questions to find books!',
                icon: 'warning',
                confirmButtonColor: '#14532d'
            });
            return;
        }

        const keywords = [
            this.keywordMap[q1] || 'fiction',
            this.keywordMap[q2] || 'adventure',
            this.keywordMap[q3] || 'nature'
        ];
        const query = keywords.map(k => `(${k})`).join(' AND ');
        this.toggleSection('results');
        this.fetchBooks(query);
    }

    static searchByTitle() {
        const query = this.DOM.titleInput.value.trim();
        if (!query) {
            Swal.fire({
                title: 'Empty Search',
                text: 'Please enter a book title or author to search.',
                icon: 'warning',
                confirmButtonColor: '#14532d'
            });
            return;
        }
        this.toggleSection('results');
        this.fetchBooks(query, 8);
    }

    // Decorative Elements
    static createLeaves() {
        const leavesContainer = document.querySelector('.jungle-leaves');
        if (!leavesContainer) return;

        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.animationDuration = `${15 + Math.random() * 15}s`;
            leaf.style.animationDelay = `${Math.random() * 5}s`;
            leaf.style.opacity = `${0.2 + Math.random() * 0.3}`;
            leavesContainer.appendChild(leaf);
        }
    }

    // Initialize
    static init() {
        // Initialize saved books
        if (!localStorage.getItem('savedBooks')) {
            localStorage.setItem('savedBooks', JSON.stringify(this.sampleBooks));
        }

        // Event Listeners
        this.DOM.navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                this.toggleSection(link.getAttribute('href').substring(1));
            });
        });

        this.DOM.hamburgerBtn?.addEventListener('click', function () {
            this.classList.toggle('open');
            BookSearchApp.DOM.navLinksContainer.classList.toggle('open');
        });

        this.DOM.bookPickerBtn?.addEventListener('click', e => {
            e.preventDefault();
            this.toggleSection('inputModal');
        });

        this.DOM.backToPickerBtn?.addEventListener('click', () => {
            this.toggleSection('inputModal');
        });

        this.DOM.bookPickerForm?.addEventListener('submit', e => {
            e.preventDefault();
            this.searchByPreferences();
        });

        this.DOM.titleSearchBtn?.addEventListener('click', e => {
            e.preventDefault();
            this.searchByTitle();
        });

        this.DOM.titleInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchByTitle();
            }
        });

        this.DOM.moreBooksBtn?.addEventListener('click', () => {
            const query = this.DOM.titleInput.value.trim() || 'jungle adventure';
            this.fetchBooks(query, 12);
        });

        // Create decorative leaves
        this.createLeaves();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => BookSearchApp.init());