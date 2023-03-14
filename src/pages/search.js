document.addEventListener('DOMContentLoaded', () => {
	const mangaContainer = document.getElementById('manga-container');
	const historyContainer = document.getElementById('history');
	const historyItems = document.getElementsByClassName('searched-item');
	const searchForm = document.getElementById('search-form');
	const navForm = document.getElementById('nav-form');
	const searchBar = document.getElementById('search');
	const navSearchBar = document.getElementById('nav-search');
	const submitBtn = document.getElementById('submit-btn');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');

	const userIsSignedIn = async () => {
		const data = await fetchIsSignedIn();
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const ifParamsPresentElse = () => {
		if (window.location.search) {
			// with search input
			getValuesFromStorage(searchBar, mangaContainer, historyContainer, searchBar, submitBtn);
		} else {
			// initialization, with no search input
			getSearched(mangaContainer);
			generateHistFromStorage(historyContainer, searchBar, submitBtn);
		}
	};

	const onFormSubmit = (e, navInput) => {
		e.preventDefault();
		const value = e.target[0].value;
		if (navInput) {
			searchBar.value = value;
			navInput.value = '';
		}
		getSearched(mangaContainer, value);
		removeHistItemIfExist(value, historyContainer, historyItems);
		generateHistory(value, historyContainer, searchBar, submitBtn);
		saveHistToStorage(value);
		changeUrlParams('searched', value);
	};

	userIsSignedIn();
	ifParamsPresentElse();
	searchForm.onsubmit = (e) => onFormSubmit(e);
	navForm.onsubmit = (e) => onFormSubmit(e, navSearchBar);
});

// helpers
const fetchIsSignedIn = async () => {
	const options = {
		method: 'GET',
		credentials: 'include',
	};
	const res = await fetch('https://mangahub-server.herokuapp.com/is-signed-in', options);
	const data = await res.json();
	return data;
};

const fetchMangaAPI = async (input = 'solo') => {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
			'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
		},
	};
	const res = await fetch(`https://manga-scrapper.p.rapidapi.com/search?q=${input}`, options);
	const data = await res.json();
	return data;
};

const generateMangaItem = (
	container,
	mLink,
	mImg = '/mangahub/img/img_placeholder.jpg',
	mTitle,
	mDesc = 'No available description.',
	mGenre,
	mProvider
) => {
	if (mTitle.length > 83) mTitle = mTitle.slice(0, 83) + '...';
	let desc = mDesc.replaceAll(/<br(?: \/)?>/g, '');
	if (desc.length > 200) desc = desc.slice(0, 200) + '...';

	const divContainer = createDivEl('d-flex manga-item');
	const aImg = createAEl(null, mLink);
	const img = createImgEl('manga-img h-100', mImg, mTitle);
	const divInfo = createDivEl('d-flex manga-info');
	const aTitle = createAEl('manga-title', mLink);
	const pDesc = createPElWithText('manga-desc', desc);
	const pGenre = createPElWithText('manga-genre', `Genre: ${mGenre}`);
	const pProvider = createPElWithText('manga-genre', `Provider: ${mProvider} Scans`);

	aTitle.append(mTitle);
	divInfo.append(aTitle, pDesc, pGenre, pProvider);
	aImg.appendChild(img);
	divContainer.append(aImg, divInfo);
	container.appendChild(divContainer);
};

const generateHistory = (text, container, input, btn) => {
	const firstChild = container.firstElementChild;
	const p = createPElWithText('searched-item d-inline', text);
	firstChild ? container.prepend(p) : container.appendChild(p);
	p.onclick = () => {
		input.value = p.textContent;
		btn.click();
	};
};

const generateHistFromStorage = (container, input, btn) => {
	const historyArr = JSON.parse(sessionStorage.getItem('history'));
	historyArr && historyArr.forEach((item) => generateHistory(item, container, input, btn));
};

const getSearched = async (container, input) => {
	const mangas = await fetchMangaAPI(input);
	Array.isArray(mangas) && emptyParent(container);
	mangas.forEach((manga) =>
		generateMangaItem(
			container,
			mangaUrl(manga.slug, manga.provider),
			manga.coverURL,
			manga.title,
			manga.synopsis,
			manga.genre && manga.genre.join(', '),
			manga.provider.substring(0, 1).toUpperCase() + manga.provider.substring(1)
		)
	);
};

const getValuesFromStorage = (inputBar, resultContainer, histContainer, input, btn) => {
	const query = window.location.search;
	let searched = query.slice(query.indexOf('=') + 1).replaceAll('+', ' ');
	inputBar.value = searched;
	getSearched(resultContainer, searched);
	saveHistToStorage(searched);
	generateHistFromStorage(histContainer, input, btn);
};

const saveHistToStorage = (value) => {
	const historyArr = JSON.parse(sessionStorage.getItem('history'));
	if (!historyArr) {
		sessionStorage.setItem('history', JSON.stringify([value]));
	} else {
		historyArr.includes(value) && historyArr.splice(historyArr.indexOf(value), 1);
		historyArr.push(value);
		sessionStorage.setItem('history', JSON.stringify(historyArr));
	}
};

const removeHistItemIfExist = (input, histParent, histChildren) => {
	const historyArr = Array.from(histChildren).map((item) => item.textContent);
	const inputIndex = historyArr.indexOf(input);
	inputIndex > -1 && histParent.removeChild(histChildren[inputIndex]);
};

const mangaUrl = (mangaId, group) => `/mangahub/pages/manga.html?id=${mangaId}&provider=${group}`;

// utils
const createEl = (el) => document.createElement(el);

const createDivEl = (className) => {
	const div = createEl('div');
	div.className = className;
	return div;
};

const createAEl = (className, href) => {
	const a = createEl('a');
	a.className = className;
	a.href = href;
	return a;
};

const createImgEl = (className, src, alt) => {
	const img = createEl('img');
	img.className = className;
	img.src = src;
	img.alt = alt;
	img.onerror = () => {
		img.onerror = '';
		img.src = '/mangahub/img/img_placeholder.jpg';
		return true;
	};
	return img;
};

const createPElWithText = (className, text) => {
	const p = createEl('p');
	p.className = className;
	p.append(text);
	return p;
};

const emptyParent = (parent) => {
	let firstChild = parent.firstElementChild;
	while (firstChild) {
		parent.removeChild(firstChild);
		firstChild = parent.firstElementChild;
	}
};

const changeUrlParams = (key, value) => {
	const queryParams = new URLSearchParams(window.location.search);
	queryParams.set(key, value);
	history.pushState(null, null, '?' + queryParams.toString());
};
