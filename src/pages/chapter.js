document.addEventListener('DOMContentLoaded', () => {
	const dropdowns = document.getElementsByClassName('chapter-list');
	const chapterImgs = document.getElementById('chapter-imgs');
	const prevBtns = document.getElementsByClassName('prev');
	const nextBtns = document.getElementsByClassName('next');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');
	const query = window.location.search;
	const mangaId = query.substring(query.indexOf('mangaid=') + 10, query.indexOf('&'));
	let chapterId = query.substring(query.indexOf('chapterId=') + 10, query.indexOf('&provider'));
	const provider = query.substring(query.indexOf('provider=') + 9);
	const mangaLink = `https://manga-scrapper.p.rapidapi.com/series/${mangaId}/chapters/?provider=${provider}`;
	let chapterLink = `https://manga-scrapper.p.rapidapi.com/series/${mangaId}/chapter/${chapterId}/?provider=${provider}`;

	const userIsSignedIn = async () => {
		const data = await fetchIsSignedIn();
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const getChapters = async () => {
		let chapters = await fetchMangaAPI(mangaLink);
		const title = document.getElementById('title');
		const formatTitle = mangaId
			.replaceAll('-', ' ')
			.split(' ')
			.map((word) => word[0].toUpperCase() + word.substring(1))
			.join(' ');
		title.textContent = formatTitle;
		document.title = `MangaHub | ${formatTitle}`;
		chapters.series.sort((a, b) => a.ChapterOrder - b.ChapterOrder);
		generateChapterList(dropdowns, chapters.series, chapterId);
	};

	const getChapterImgs = async (link) => {
		const data = await fetchMangaAPI(link);
		emptyParent(chapterImgs);
		data.ChapterContent.forEach((img, i) => generateChapterImgs(img, i, chapterImgs));
		Array.from(prevBtns).forEach(
			(btn) =>
				(btn.onclick = !data.ChapterPrevSlug
					? null
					: () => onClickPrevNextBtns(data.ChapterPrevSlug))
		);
		Array.from(nextBtns).forEach(
			(btn) =>
				(btn.onclick = !data.ChapterNextSlug
					? null
					: () => onClickPrevNextBtns(data.ChapterNextSlug))
		);
	};

	const onClickPrevNextBtns = (id) => {
		chapterLink = `https://manga-scrapper.p.rapidapi.com/series/${mangaId}/chapter/${id}/?provider=${provider}`;
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
			chapterLink = `https://manga-scrapper.p.rapidapi.com/series/${mangaId}/chapter/${chapterId}/?provider=${provider}`;
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
	return data.data;
};

const generateChapterList = (dropdowns, mChapters, chapterId) => {
	Array.from(dropdowns).forEach((dropdown) => {
		mChapters.forEach((item) => {
			const opt = document.createElement('option');
			opt.value = item._id;
			opt.append(item.ChapterTitle);
			dropdown.appendChild(opt);
		});
		dropdown.value = chapterId;
	});
};

const generateChapterImgs = (cImg, page, container) => {
	const img = createImgEl('w-100', cImg, `page ${page}`);
	container.appendChild(img);
};

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
