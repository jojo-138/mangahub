document.addEventListener('DOMContentLoaded', () => {
	const registerForm = document.getElementById('register');
	const inputs = document.querySelectorAll('#register input');
	const errorMsg = document.getElementById('error-msg');

	registerForm.onsubmit = async (e) => {
		e.preventDefault();
		const [fname, username, password] = Array.from(inputs).map((input) => input.value);
		const res = await fetchRegister(fname, username, password);
		if (res.status === 'success')
			return (window.location.href = 'https://jojo-138.github.io/mangahub/pages/profile.html');
		errorMsg.textContent = res.msg;
		toggleMsg(errorMsg, 5000);
	};
});

// helper
const fetchRegister = async (fname, username, password) => {
	const options = {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ fname, username, password }),
	};
	const res = await fetch('https://mangahub-server.herokuapp.com/register', options);
	const data = await res.json();
	return data;
};

// utility
const toggleMsg = (msg, time) => {
	msg.classList.toggle('hidden');
	setTimeout(() => msg.classList.toggle('hidden'), time);
};
