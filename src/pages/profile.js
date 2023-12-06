document.addEventListener('DOMContentLoaded', () => {
	const mangaContainer = document.getElementById('manga-container');
	const loading = document.getElementById('loading');

	const getUser = async () => {
		const data = await fetchServerAPI('user');
		if (data.status === 'error')
			return (window.location.href = 'https://jojo-138.github.io/mangahub/pages/signin.html');
		displayUserInfo(data.user);
	};

	const getFaves = async () => {
		const data = await fetchServerAPI('faves');
		if (data.status === 'error') return;
		loading.classList.add('hidden');
		data.faves.forEach(async (item) => {
			const manga = await fetchMangaAPI(item.manga_id, item.provider);
			generateMangaItem(
				mangaContainer,
				mangaUrl(manga.slug, manga.provider),
				manga.coverURL,
				manga.title,
				manga.synopsis,
				manga.genre && manga.genre.join(', '),
				manga.provider.substring(0, 1).toUpperCase() + manga.provider.substring(1)
			);
		});
	};

	getUser();
	getFaves();
});

// helpers
const serverOptions = {
	method: 'GET',
	credentials: 'include',
};

const fetchServerAPI = async (action) => {
	const link =
		action === 'user'
			? 'https://mangahub-server.herokuapp.com/user'
			: 'https://mangahub-server.herokuapp.com/faves';
	const res = await fetch(link, serverOptions);
	const data = await res.json();
	return data;
};

const fetchMangaAPI = async (id, group) => {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
			'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
		},
	};
	const res = await fetch(
		`https://manga-scrapper.p.rapidapi.com/webtoons/${id}?provider=${group}`,
		options
	);
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
	const pProvider = createPElWithText('manga-genre', `Provider: ${mProvider} Scans`);

	aTitle.append(mTitle);
	divInfo.append(aTitle, pDesc, pGenre, pProvider);
	aImg.appendChild(img);
	divContainer.append(aImg, divInfo);
	container.appendChild(divContainer);
};

const displayUserInfo = (userObj) => {
	const fname = document.getElementById('fname');
	const favesAmount = document.getElementById('faves-amount');
	const joinedAt = document.getElementById('joined-at');
	fname.textContent = userObj.fname;
	favesAmount.textContent = userObj.favesAmount;
	joinedAt.textContent = userObj.joinedAt;
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
