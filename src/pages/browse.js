document.addEventListener('DOMContentLoaded', () => {
	const mangaContainer = document.getElementById('manga-container');
	const selected = document.getElementById('selected');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');
	const loading = document.getElementById('loading');
	const selectedGroup = window.location.search.substring(7) || 'asura';

	const userIsSignedIn = async () => {
		const data = await fetchIsSignedIn();
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const getBrowse = async () => {
		const mangas = await fetchMangaAPI(selectedGroup);
		Array.isArray(mangas) && loading.remove();
		mangas.forEach((manga) =>
			generateMangaItem(
				mangaContainer,
				mangaUrl(manga.slug, manga.provider),
				manga.coverURL,
				manga.title,
				manga.synopsis,
				manga.genre && manga.genre.join(', ')
			)
		);
	};

	userIsSignedIn();
	getBrowse();
	selected.append(selectedGroup[0].toUpperCase() + selectedGroup.substring(1));
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

const fetchMangaAPI = async (group = 'asura') => {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
			'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
		},
	};
	const res1 = await fetch(
		`https://manga-scrapper.p.rapidapi.com/webtoons/all?provider=${group}`,
		options
	);
	const res2 = await fetch(
		`https://manga-scrapper.p.rapidapi.com/webtoons/all?provider=${group}`,
		options
	);
	const res3 = await fetch(
		`https://manga-scrapper.p.rapidapi.com/webtoons/all?provider=${group}`,
		options
	);
	const mangas1 = await res1.json();
	const mangas2 = await res2.json();
	const mangas3 = await res3.json();
	return [...mangas1, ...mangas2, ...mangas3];
};

const generateMangaItem = (
	container,
	mLink,
	mImg = '/mangahub/img/img_placeholder.jpg',
	mTitle,
	mDesc = 'No available description.',
	mGenre
) => {
	if (mTitle.length > 83) mTitle = mTitle.slice(0, 83) + '...';
	let desc = mDesc.replaceAll(/<br(?: \/)?>/g, '');
	if (desc.length > 200) desc = desc.slice(0, 200) + '...';

	const editedImgLink = mImg.includes('www.asurascans')
		? mImg.replace('www.asurascans', 'asuratoon')
		: mImg.includes('asurascans')
		? mImg.replace('asurascans', 'asuratoon')
		: mImg.includes('asura.gg')
		? mImg.replace('asura.gg', 'asuratoon.com')
		: mImg.includes('i3.wp.com/cosmicscans')
		? mImg.replace('i3.wp.com/cosmicscans', 'cosmic-scans')
		: mImg.includes('cosmicscans')
		? mImg.replace('cosmicscans', 'cosmic-scans')
		: mImg.includes('flamescans.org')
		? mImg.replace('flamescans.org', 'flamecomics.com')
		: mImg.includes('anigliscans')
		? mImg.replace('.com', '.xyz')
		: mImg.includes('luminousscans')
		? mImg.replace('.com', '.net')
		: mImg.includes('suryascans')
		? mImg.replace('suryascans', 'suryacomics')
		: mImg;
	const divContainer = createDivEl('d-flex manga-item');
	const aImg = createAEl(null, mLink);
	const img = createImgEl('manga-img h-100', editedImgLink, mTitle);
	const divInfo = createDivEl('d-flex manga-info');
	const aTitle = createAEl('manga-title', mLink);
	const pDesc = createPElWithText('manga-desc', desc);
	const pGenre = createPElWithText('manga-genre', `Genre: ${mGenre}`);

	aTitle.append(mTitle);
	divInfo.append(aTitle, pDesc, pGenre);
	aImg.appendChild(img);
	divContainer.append(aImg, divInfo);
	container.appendChild(divContainer);
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
