document.addEventListener('DOMContentLoaded', () => {
	const mangaContainer = document.getElementById('manga-container');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');

	const userIsSignedIn = async () => {
		const data = await fetchServerAPI('isSignedIn');
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const getUser = async () => {
		const data = await fetchServerAPI('user');
		if (data.status === 'error')
			return (window.location.href = 'https://jojo-138.github.io/mangahub/pages/signin.html');
		displayUserInfo(data.user);
	};

	const getFaves = async () => {
		const data = await fetchServerAPI('faves');
		if (data.status === 'error') return;
		data.faves.forEach(async (item) => {
			const manga = await fetchMangaAPI(item.manga_id, item.provider);
			generateMangaItem(
				mangaContainer,
				mangaUrl(item.manga_id, item.provider),
				manga.MangaCover,
				manga.MangaTitle,
				manga.MangaSynopsis
			);
		});
	};

	userIsSignedIn();
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
		action === 'isSignedIn'
			? 'https://mangahub-server.herokuapp.com/is-signed-in'
			: action === 'user'
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
		`https://manga-scrapper.p.rapidapi.com/series/${id}/?provider=${group}`,
		options
	);
	const data = await res.json();
	return data.data;
};

const generateMangaItem = (
	container,
	mLink,
	mImg = '/mangahub/img/img_placeholder.jpg',
	mTitle,
	mDesc = 'No available description.'
) => {
	if (mTitle.length > 83) mTitle = mTitle.slice(0, 83) + '...';
	let desc = mDesc.replaceAll('<br>', '');
	if (desc.length > 200) desc = desc.slice(0, 200) + '...';

	const divContainer = createDivEl('d-flex manga-item');
	const aImg = createAEl(null, mLink);
	const img = createImgEl('manga-img h-100', mImg, mTitle);
	const divInfo = createDivEl('d-flex manga-info');
	const aTitle = createAEl('manga-title', mLink);
	const pDesc = createPElWithText('manga-desc', desc);

	aTitle.append(mTitle);
	divInfo.append(aTitle, pDesc);
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
	return img;
};

const createPElWithText = (className, text) => {
	const p = createEl('p');
	p.className = className;
	p.append(text);
	return p;
};
