// function mobileNav() {
// 	const navBtnOpen = document.querySelector('#modalOpen');
// 	const navBtnClose = document.querySelector('#modalClose');

// 	const navOverlay = document.querySelector('#mobileNavOverlay');
// 	const nav = document.querySelector('#mobileNav');

// 	navBtnOpen.onclick = toggleMobileNav;
// 	navBtnClose.onclick = toggleMobileNav;
// 	navOverlay.onclick = toggleMobileNav;

// 	function toggleMobileNav() {
// 		navOverlay.classList.toggle('mobile-nav-overlay--open');
// 		nav.classList.toggle('mobile-nav--open');
// 		document.body.classList.toggle('no-scroll');
// 	}
// }

function mobileNav() {
	const burgerMenu = document.querySelector('.icon-menu');
	const menuBody = document.querySelector('.menu__body');

	if (burgerMenu) {
		burgerMenu.addEventListener("click", function (e) {
			burgerMenu.classList.toggle('_active');
			if (menuBody) {
				menuBody.classList.toggle('_active');
			}
		});
	}
}

export default mobileNav;