document.addEventListener('DOMContentLoaded', () => {
	const dropdowns = document.getElementsByClassName('chapter-list');
	const chapterImgs = document.getElementById('chapter-imgs');
	const noChapterImgs = document.getElementById('no-chater-imgs');
	const prevBtns = document.getElementsByClassName('prev');
	const nextBtns = document.getElementsByClassName('next');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');
	const title = document.getElementById('title');
	const query = window.location.search;
	const mangaId = query.substring(query.indexOf('mangaid=') + 10, query.indexOf('&'));
	let chapterId = query.substring(query.indexOf('chapterId=') + 10, query.indexOf('&provider'));
	const provider = query.substring(query.indexOf('provider=') + 9);
	const mangaLink = `https://manga-scrapper.p.rapidapi.com/chapters/all?provider=${provider}&webtoon=${mangaId}`;
	let chapterLink = `https://manga-scrapper.p.rapidapi.com/chapters/${chapterId}?provider=${provider}&webtoon=${mangaId}`;

	const userIsSignedIn = async () => {
		const data = await fetchIsSignedIn();
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const getChapters = async () => {
		let chapters = await fetchMangaAPI(mangaLink);
		title.textContent = formatTitle(mangaId);
		document.title = `MangaHub | ${formatTitle(chapterId)}`;
		chapters.sort((a, b) => a.chapterNum - b.chapterNum);
		generateChapterList(dropdowns, chapters, chapterId);
	};

	const getChapterImgs = async (link) => {
		const data = await fetchMangaAPI(link);
		document.title = `MangaHub | ${data.fullTitle}`;
		emptyParent(chapterImgs);
		window.scrollTo(0, 0);
		data.contentURL
			? data.contentURL.forEach((img, i) => generateChapterImgs(img, i + 1, chapterImgs))
			: noChapterImgsShown(chapterImgs, noChapterImgs);
		Array.from(prevBtns).forEach(
			(btn) =>
				(btn.onclick = !data.chapterNav.prevSlug
					? null
					: () => onClickPrevNextBtns(data.chapterNav.prevSlug))
		);
		Array.from(nextBtns).forEach(
			(btn) =>
				(btn.onclick = !data.chapterNav.nextSlug
					? null
					: () => onClickPrevNextBtns(data.chapterNav.nextSlug))
		);
	};

	const onClickPrevNextBtns = (id) => {
		chapterImgs.classList.remove('hidden');
		noChapterImgs.classList.add('hidden');
		chapterLink = `https://manga-scrapper.p.rapidapi.com/chapters/${id}?provider=${provider}&webtoon=${mangaId}`;
		getChapterImgs(chapterLink);
		changeUrlParams('chapterId', id);
		selectCurrChapter(id);
	};

	const selectCurrChapter = (chapterId) =>
		Array.from(dropdowns).forEach((dropdown) => (dropdown.value = chapterId));

	userIsSignedIn();
	getChapters();
	getChapterImgs(chapterLink);
	Array.from(dropdowns).forEach((dropdown) => {
		dropdown.onchange = () => {
			const selected = dropdown.value;
			chapterId = selected;
			chapterLink = `https://manga-scrapper.p.rapidapi.com/chapters/${chapterId}?provider=${provider}&webtoon=${mangaId}`;
			getChapterImgs(chapterLink);
			changeUrlParams('chapterId', selected);
			selectCurrChapter(chapterId);
		};
	});
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

const fetchMangaAPI = async (link) => {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
			'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
		},
	};
	const res = await fetch(link, options);
	const data = await res.json();
	return data;
};

const generateChapterList = (dropdowns, mChapters, chapterId) => {
	Array.from(dropdowns).forEach((dropdown) => {
		mChapters.forEach((item) => {
			if (item.contentURL) {
				const opt = document.createElement('option');
				opt.value = item.slug;
				opt.append(item.shortTitle);
				dropdown.appendChild(opt);
			}
		});
		dropdown.value = chapterId;
	});
};

const generateChapterImgs = (cImg, page, container) => {
	const editedImgLink = cImg.includes('www.asurascans')
		? cImg.replace('www.asurascans', 'asuratoon')
		: cImg.includes('asurascans')
		? cImg.replace('asurascans', 'asuratoon')
		: cImg.includes('asura.gg')
		? cImg.replace('asura.gg', 'asuratoon.com')
		: cImg.includes('i3.wp.com/cosmicscans')
		? cImg.replace('i3.wp.com/cosmicscans', 'cosmic-scans')
		: cImg.includes('cosmicscans')
		? cImg.replace('cosmicscans', 'cosmic-scans')
		: cImg.includes('flamescans.org')
		? cImg.replace('flamescans.org', 'flamecomics.com')
		: cImg.includes('anigliscans')
		? cImg.replace('.com', '.xyz')
		: cImg.includes('luminousscans')
		? cImg.replace('.com', '.net')
		: cImg.includes('suryascans')
		? cImg.replace('suryascans', 'suryacomics')
		: cImg;
	const img = createImgEl('w-100', editedImgLink, `page ${page}`);
	container.appendChild(img);
};

const noChapterImgsShown = (chapterImgs, noChapterImgs) => {
	chapterImgs.classList.add('hidden');
	noChapterImgs.classList.remove('hidden');
}

// utils
const createEl = (el) => document.createElement(el);

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

const changeUrlParams = (key, value) => {
	const queryParams = new URLSearchParams(window.location.search);
	queryParams.set(key, value);
	history.pushState(null, null, '?' + queryParams.toString());
};

const emptyParent = (parent) => {
	let firstChild = parent.firstElementChild;
	while (firstChild) {
		parent.removeChild(firstChild);
		firstChild = parent.firstElementChild;
	}
};

const formatTitle = (title) => {
	return title
		.replaceAll('-', ' ')
		.split(' ')
		.map((word) => word[0].toUpperCase() + word.substring(1))
		.join(' ');
};
