document.addEventListener('DOMContentLoaded', () => {
	const signinForm = document.getElementById('signin');
	const inputs = document.querySelectorAll('#signin input');
	const errorMsg = document.getElementById('error-msg');

	signinForm.onsubmit = async (e) => {
		e.preventDefault();
		const [username, password] = Array.from(inputs).map((input) => input.value);
		const res = await fetchSignin(username, password);
		if (res.status === 'success')
			return (window.location.href = 'https://jojo-138.github.io/mangahub/pages/profile.html');
		errorMsg.textContent = res.msg;
		toggleMsg(errorMsg, 5000);
	};
});

// helper
const fetchSignin = async (username, password) => {
	const options = {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	};
	const res = await fetch('https://mangahub-server.herokuapp.com/signin', options);
	const data = await res.json();
	return data;
};

// utility
const toggleMsg = (msg, time) => {
	msg.classList.toggle('hidden');
	setTimeout(() => msg.classList.toggle('hidden'), time);
};
