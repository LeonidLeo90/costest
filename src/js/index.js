import mobileNav from './modules/mobile-nav.js';

mobileNav();

import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';

new AirDatepicker('#date');

//табы

document.querySelectorAll(".tab").forEach((item) =>
	item.addEventListener("click", function (evt) {
		evt.preventDefault();
		const id = evt.target.getAttribute("href").replace("#", "");

		document.querySelectorAll(".tab").forEach((child) => {
			child.classList.remove("tab--active");
		});
		document.querySelectorAll(".content").forEach((child) => {
			child.classList.remove("content--active");
		});
		item.classList.add("tab--active");
		document.getElementById(id).classList.add("content--active");
	})
);

document.querySelector(".tab").click();

//табы

