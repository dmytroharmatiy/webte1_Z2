const status = document.querySelector('#menu-status');
const cards = document.querySelector('#restaurant-cards');
const refreshButton = document.querySelector('#refresh-menu');
const clearButton = document.querySelector('#clear-menu');
const dayButtons = document.querySelectorAll('[data-day]');
const restaurantFilters = document.querySelectorAll('[data-restaurant-filter]');
const weekdayNames = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok'];
const today = dayjs().day();
let selectedDay = String(today >= 1 && today <= 5 ? today : 1);
const restaurants = [
    { id: 'fiitfood', name: 'FiitFood (FIIT STU)', file: 'data/freefood.html', url: 'http://www.freefood.sk/menu/#fiit-food', parse: parseFiitFood },
    { id: 'eatandmeet', name: 'Eat & Meet', file: 'data/eatandmeet.html', url: 'https://eatandmeet.sk/', parse: parseEatAndMeet },
    { id: 'drag', name: 'Reštaurácia DRAG', file: 'data/drag.html', url: 'https://www.restauracia-drag.sk/denne-menu', parse: parseDrag },
].map((restaurant) => ({ ...restaurant, days: [], updatedAt: '', error: '', loading: false }));

// Each restaurant parser returns the same structure of days and dishes.
function parseFiitFood(html) {
    const document = new DOMParser().parseFromString(html, 'text/html');
    const days = document.querySelectorAll('#fiit-food .daily-offer > li');
    if (!days.length) throw new Error('Štruktúra menu sa zmenila alebo menu chýba.');

    return Array.from(days, (day) => {
        const title = day.querySelector('.day-title')?.textContent.trim();
        if (!title) throw new Error('V menu chýba označenie dňa.');
        const [name, date = ''] = title.split(',').map((part) => part.trim());
        const weekdays = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok'];
        const weekday = weekdays.indexOf(name.toLowerCase()) + 1;
        if (!weekday) throw new Error('Neznámy deň v menu.');
        let closed = false;
        const dishes = [];

        day.querySelectorAll('.day-offer > li').forEach((item) => {
            const price = item.querySelector('.price')?.textContent.trim() || '';
            const label = item.querySelector('.brand:not(.price)')?.textContent.trim();
            const copy = item.cloneNode(true);
            copy.querySelectorAll('span').forEach((span) => span.remove());
            let text = copy.textContent.replace(/\s+/g, ' ').trim();
            if (/zatvorené/i.test(text)) {
                closed = true;
                return;
            }
            if (!text) return;
            const allergens = text.match(/A:\s*([\d,\s]*)/);
            const portion = text.match(/\d+(?:[.,]\d+)?\s*(?:g|ml|l)(?:\s*,\s*\d+(?:[.,]\d+)?\s*(?:g|ml|l))*/i);
            const vegetarian = text.includes('(V)');
            text = text.replace(/A:\s*[\d,\s]*/, '').replace('(V)', '');
            if (portion) text = text.replace(portion[0], '');
            dishes.push({
                type: label === 'P.' ? 'Polievka' : 'Hlavné jedlo',
                name: text.trim(),
                price,
                portion: portion?.[0] || '',
                allergens: allergens?.[1].trim() || '',
                vegetarian,
            });
        });
        return { weekday, name, date, closed, dishes };
    });
}


function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}


function renderDays(content, days) {
    const visibleDays = days.filter((day) => selectedDay === 'all' || String(day.weekday) === selectedDay);
    if (!visibleDays.length) {
        content.append(element('p', 'text-secondary', 'Menu na tento deň nie je k dispozícii.'));
    }
    visibleDays.forEach((day) => {
        const section = element('section', 'mb-4');
        section.append(element('h3', 'h5 text-capitalize mb-3', [day.name, day.date].filter(Boolean).join(" · ")));
        if (day.closed || !day.dishes.length) {
            section.append(element('p', 'text-secondary', day.closed ? 'Zatvorené' : 'Menu na tento deň nie je k dispozícii.'));
        } else {
            const list = element('ul', 'list-group list-group-flush');
            day.dishes.forEach((dish) => {
                const item = element('li', 'list-group-item px-0 py-3');
                const row = element('div', 'd-flex justify-content-between align-items-start gap-3');
                const details = element('div', '');
                details.append(element('span', dish.type === 'Polievka' ? 'badge meal-badge soup-badge mb-2' : 'badge meal-badge main-dish-badge mb-2', dish.type));
                details.append(element('p', 'mb-1', dish.name));
                const metadata = [dish.portion, dish.allergens ? `Alergény: ${dish.allergens}` : '', dish.vegetarian ? 'Vegetariánske' : ''].filter(Boolean);
                details.append(element('p', 'small text-secondary mb-0', metadata.join(' · ')));
                row.append(details, element('strong', 'text-end small', dish.price || 'Cena neuvedená'));
                item.append(row);
                list.append(item);
            });
            section.append(list);
        }
        content.append(section);
    });
}

function parseDish(text, type, price, suppliedAllergens = '') {
    text = text.replace(/\s+/g, ' ').trim();
    const allergens = text.match(/\/([\d,\s]+)\//);
    const portion = text.match(/\d+(?:[.,]\d+)?\s*(?:g|ml|l)(?:\s*[\/,]\s*\d+(?:[.,]\d+)?\s*(?:g|ml|l))*/i);
    let name = text;
    if (allergens) name = name.replace(allergens[0], '');
    if (portion) name = name.replace(portion[0], '');
    return { type, name: name.trim(), price, portion: portion?.[0] || '', allergens: suppliedAllergens || allergens?.[1].trim() || '', vegetarian: text.includes('(V)') };
}

function parseEatAndMeet(html) {
    const document = new DOMParser().parseFromString(html, 'text/html');
    const days = weekdayNames.map((name, index) => {
        const panel = document.querySelector(`#day-${index + 1}`);
        if (!panel) return null;
        const dishes = Array.from(panel.querySelectorAll('.menu-body'), (item) => {
            const description = item.querySelector('.desc');
            if (!description) return null;
            const allergens = description.querySelector('span')?.textContent.replace(/[()]/g, '').trim() || '';
            const copy = description.cloneNode(true);
            copy.querySelectorAll('span').forEach((span) => span.remove());
            const label = item.querySelector('h4')?.textContent.trim() || '';
            const price = item.querySelector('.price')?.textContent.replace(/\s+/g, ' ').trim() || '';
            const dish = parseDish(copy.textContent, /polievka/i.test(label) ? 'Polievka' : 'Hlavné jedlo', price, allergens);
            return dish.name ? dish : null;
        }).filter(Boolean);
        return { weekday: index + 1, name, date: '', closed: false, dishes };
    }).filter(Boolean);
    if (!days.length || !days.some((day) => day.dishes.length)) throw new Error('Štruktúra menu sa zmenila alebo menu chýba.');
    return days;
}

function parseDrag(html) {
    const document = new DOMParser().parseFromString(html, 'text/html');
    const ids = ['pondelok', 'utorok', 'streda', 'stvrtok', 'piatok'];
    const days = ids.map((id, index) => {
        const panel = document.querySelector(`#${id}`);
        if (!panel) return null;
        const dishes = [];
        const soupHeading = Array.from(panel.querySelectorAll('.menu_box_title')).find((heading) => /polievka/i.test(heading.textContent));
        let soup = '';
        // Soup is stored between two headings, sometimes as plain text, sometimes in paragraphs.
        for (let node = soupHeading?.nextSibling; node; node = node.nextSibling) {
            if (node.nodeType === 1 && (node.matches('.menu_box_title') || node.matches('table'))) break;
            if (node.nodeType === 3 || (node.nodeType === 1 && !node.matches('script, style'))) soup += ` ${node.textContent}`;
        }
        if (soup.trim()) dishes.push(parseDish(soup, 'Polievka', ''));
        panel.querySelectorAll('table tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (!cells[0]?.textContent.trim()) return;
            dishes.push(parseDish(cells[0].textContent, 'Hlavné jedlo', cells[1]?.textContent.replace(/\s+/g, ' ').trim() || ''));
        });
        return { weekday: index + 1, name: weekdayNames[index], date: '', closed: /zatvorené/i.test(panel.textContent), dishes };
    }).filter(Boolean);
    if (!days.length || !days.some((day) => day.dishes.length)) throw new Error('Štruktúra menu sa zmenila alebo menu chýba.');
    return days;
}

function renderMenu() {
    dayButtons.forEach((button) => {
        const active = button.dataset.day === selectedDay;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    cards.replaceChildren();
    const selectedIds = new Set(Array.from(restaurantFilters).filter((input) => input.checked).map((input) => input.value));
    const visibleRestaurants = restaurants.filter((restaurant) => selectedIds.has(restaurant.id));
    cards.classList.remove('row-cols-lg-1', 'row-cols-lg-2', 'row-cols-lg-3');
    cards.classList.add(`row-cols-lg-${Math.max(1, visibleRestaurants.length)}`);
    document.querySelector('#restaurant-filter-status').hidden = visibleRestaurants.length > 0;
    visibleRestaurants.forEach((restaurant) => {
        const column = element('div', 'col');
        const card = element('article', 'card h-100 rounded-4');
        card.dataset.restaurant = restaurant.id;
        card.setAttribute('aria-labelledby', `${restaurant.id}-title`);
        const body = element('div', 'card-body p-3 p-xl-4');
        const heading = element('h2', 'h4 card-title', restaurant.name);
        heading.id = `${restaurant.id}-title`;
        const link = element('a', 'small', 'Pôvodná stránka reštaurácie');
        link.href = restaurant.url;
        body.append(heading, link);
        if (restaurant.updatedAt) body.append(element('p', 'small text-secondary mt-2', `Posledná aktualizácia: ${dayjs(restaurant.updatedAt).format('DD.MM.YYYY HH:mm:ss')}`));
        const content = element('div', 'mt-4');
        content.setAttribute('aria-busy', String(restaurant.loading));
        if (restaurant.loading) {
            content.append(element('p', 'text-secondary', 'Načítavam menu…'));
        } else {
            if (restaurant.error) content.append(element('p', 'alert alert-warning small', restaurant.error));
            renderDays(content, restaurant.days);
        }
        body.append(content);
        card.append(body);
        column.append(card);
        cards.append(column);
    });
}

function cacheKey(restaurant) { return `${restaurant.id}-menu-v2`; }

async function loadRestaurant(restaurant, force) {
    restaurant.error = '';
    restaurant.loading = true;
    try {
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(cacheKey(restaurant))); } catch { /* Cache is optional. */ }
        const fresh = cached && typeof cached.updatedAt === 'string' && dayjs(cached.updatedAt).isValid() && dayjs(cached.updatedAt).isSame(dayjs(), 'day') && Array.isArray(cached.days);
        if (!force && fresh) {
            restaurant.days = cached.days;
            restaurant.updatedAt = cached.updatedAt;
        } else {
            const response = await fetch(restaurant.file);
            if (!response.ok) throw new Error('HTML súbor sa nepodarilo načítať.');
            restaurant.days = restaurant.parse(await response.text());
            restaurant.updatedAt = dayjs().toISOString();
            try {
                localStorage.setItem(cacheKey(restaurant), JSON.stringify({ days: restaurant.days, updatedAt: restaurant.updatedAt }));
            } catch { /* Display still works without storage. */ }
        }
    } catch (error) {
        restaurant.error = `Menu sa nepodarilo aktualizovať. ${error.message}`;
    } finally {
        restaurant.loading = false;
        renderMenu();
    }
}

async function loadMenu(force = false) {
    refreshButton.disabled = true;
    clearButton.disabled = true;
    const spinner = element('span', 'spinner-border spinner-border-sm me-2');
    spinner.setAttribute('aria-hidden', 'true');
    status.replaceChildren(spinner, document.createTextNode('Načítavam menu…'));
    // Each source handles its own errors, so the other cards remain available.
    await Promise.all(restaurants.map((restaurant) => loadRestaurant(restaurant, force)));
    status.textContent = '';
    refreshButton.disabled = false;
    clearButton.disabled = false;
}

dayButtons.forEach((button) => button.addEventListener('click', () => {
    selectedDay = button.dataset.day;
    renderMenu();
}));
restaurantFilters.forEach((input) => input.addEventListener('change', renderMenu));
refreshButton.addEventListener('click', () => loadMenu(true));
clearButton.addEventListener('click', () => {
    try {
        restaurants.forEach((restaurant) => localStorage.removeItem(cacheKey(restaurant)));
        localStorage.removeItem('fiitfood-menu-v1');
    } catch {
        status.textContent = 'Prehliadač neumožňuje vymazať uložené údaje.';
        return;
    }
    restaurants.forEach((restaurant) => { restaurant.days = []; restaurant.updatedAt = ''; restaurant.error = ''; });
    renderMenu();
    status.textContent = 'Uložené údaje boli vymazané. Menu načítate tlačidlom Aktualizovať menu.';
});
renderMenu();
loadMenu();
