document.addEventListener('DOMContentLoaded', () => {
	const mangaErrorMsg = document.getElementById('manga-error');
	const mangaPg = document.getElementById('manga-pg');
	const chapterTbl = document.getElementById('chapter-table');
	const follow = document.getElementById('follow');
	const following = document.getElementById('following');
	const errorMsg = document.getElementById('error-msg');
	const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
	const navIcons = document.getElementById('nav-icons');
	const query = window.location.search;
	const mangaId = query.slice(query.indexOf('id=') + 3, query.indexOf('&'));
	const provider = query.slice(query.indexOf('provider=') + 9);
	let mangaError;

	const userIsSignedIn = async () => {
		const data = await fetchIsSignedIn();
		if (data.status === 'success') {
			navSigninRegisterLink.classList.toggle('hidden');
			navIcons.classList.toggle('hidden');
		}
	};

	const getManga = async () => {
		const manga = await fetchMangaAPI('manga', mangaId, provider);
		const chapters = await fetchMangaAPI('chapters', mangaId, provider);

		document.title = `MangaHub | ${manga.MangaTitle ?? 'Error'}`;

		if (!manga) {
			mangaError = true;
			mangaErrorMsg.classList.remove('hidden');
			mangaPg.classList.add('hidden');
		} else {
			generateMangaDetails(manga.MangaTitle, manga.MangaCover, manga.MangaSynopsis);
			chapters.sort((a, b) => a.ChapterOrder - b.ChapterOrder);
			chapters.forEach((chapter) =>
				generateChapterList(
					chapterTbl,
					chapterUrl(mangaId, chapter._id, provider),
					chapter.ChapterNumber,
					chapter.ChapterTitle,
					chapter.ChapterDate
				)
			);
		}
	};

	const getIsFollowing = async () => {
		const data = await fetchIsFollowing(mangaId, provider);
		data.following && isFollowing();
	};

	const followUnfollowManga = async (action) => {
		fetchFollowUnfollow;
		const data = await fetchFollowUnfollow(action, mangaId, provider);
		if (data.status === 'success') return isFollowing();
		if (data.msg === 'Unauthorized')
			return (window.location.href = 'https://jojo-138.github.io/mangahub/pages/signin.html');
		errorMsg.textContent = data.msg;
		toggleMsg(errorMsg, 5000);
	};

	const isFollowing = () => {
		follow.classList.toggle('hidden');
		following.classList.toggle('hidden');
	};

	userIsSignedIn();
	getManga();
	if (!mangaError) {
		getIsFollowing();
		follow.onclick = () => followUnfollowManga('follow');
		following.onclick = () => followUnfollowManga('unfollow');
	}
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

const fetchIsFollowing = async (mangaId, group) => {
	const options = {
		method: 'GET',
		credentials: 'include',
	};
	const res = await fetch(
		`https://mangahub-server.herokuapp.com/following?mangaId=${mangaId}&provider=${group}`,
		options
	);
	const data = await res.json();
	return data;
};

const fetchFollowUnfollow = async (action, mangaId, group) => {
	const options = {
		method: action === 'follow' ? 'POST' : 'DELETE',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ mangaId, group }),
	};
	const res = await fetch(`https://mangahub-server.herokuapp.com/${action}`, options);
	const data = await res.json();
	return data;
};

const fetchMangaAPI = async (fetchFor, id, group) => {
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
			'X-RapidAPI-Host': 'manga-scrapper.p.rapidapi.com',
		},
	};
	const res = await fetch(
		fetchFor === 'manga'
			? `https://manga-scrapper.p.rapidapi.com/series/${id}/?provider=${group}`
			: `https://manga-scrapper.p.rapidapi.com/series/${id}/chapters/?provider=${group}`,
		options
	);
	const data = await res.json();
	return fetchFor === 'manga' ? data.data : data.data.series;
};

const generateMangaDetails = (mTitle, mImg, mSummary) => {
	const title = document.getElementById('manga-title');
	const img = document.getElementById('manga-img');
	const summary = document.getElementById('summary');

	title.textContent = mTitle;
	img.src = mImg;
	img.alt = mTitle;
	summary.textContent = mSummary.replaceAll('<br>', '');
};

const generateChapterList = (container, cLink, cNum, cTitle, cUpdated) => {
	const a = createAEl('d-flex chapter', cLink);
	const divTitle = createDivEl('chapter-title');
	const divUpdated = createDivEl('updated grey-text');

	divTitle.append(`${cNum}: ${cTitle}`);
	divUpdated.append(cUpdated);
	a.append(divTitle, divUpdated);
	container.appendChild(a);
};

const chapterUrl = (mangaId, chapterId, group) =>
	`/mangahub/pages/chapter.html?mangaId=${mangaId}&chapterId=${chapterId}&provider=${group}`;

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

const toggleMsg = (msg, time) => {
	msg.classList.toggle('hidden');
	setTimeout(() => msg.classList.toggle('hidden'), time);
};
