document.addEventListener('DOMContentLoaded', () => {
	const asuraContainer = document.getElementById('asura-container');
	const flameContainer = document.getElementById('flame-container');
	const realmContainer = document.getElementById('realm-container');
	const luminousContainer = document.getElementById('luminous-container');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');

	const userIsSignedIn = async () => {
		const data = await fetchIsSignedIn();
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const getManga = async (group, container) => {
		const mangas = await fetchMangaAPI(group);
		mangas.forEach((manga) =>
			generateMangaCard(
				container,
				mangaUrl(manga._id, manga._type),
				manga.MangaCover,
				manga.MangaTitle
			)
		);
	};

	userIsSignedIn();
	getManga('asura', asuraContainer);
	getManga('flame', flameContainer);
	getManga('realm', realmContainer);
	getManga('luminous', luminousContainer);
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

const fetchMangaAPI = async (group) => {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
			'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
		},
	};
	const res = await fetch(
		`https://manga-scrapper.p.rapidapi.com/series/?provider=${group}&limit=5`,
		options
	);
	const data = await res.json();
	return data.data.series;
};

const generateMangaCard = (container, mLink, mImg, mTitle) => {
	const div = createDivEl('manga-card w-100');
	const a = createAEl(null, mLink);
	const img = createImgEl('card-img w-100 h-100', mImg, mTitle);
	const p = createPElWithText('card-title w-100', mTitle);

	a.append(img, p);
	div.appendChild(a);
	container.appendChild(div);
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
	return img;
};

const createPElWithText = (className, text) => {
	const p = createEl('p');
	p.className = className;
	p.append(text);
	return p;
};
