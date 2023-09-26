//Режим разработки

const gulp = require('gulp');
const fileInclude = require('gulp-file-include'); //Сборка Html
const sass = require('gulp-sass')(require('sass'));  //Сборка SCSS
const sassGlob = require('gulp-sass-glob'); //автоподключение SCSS
const server = require('gulp-server-livereload'); //Запуск сервера автообновления
const clean = require('gulp-clean'); // Удаление папки dist
const fs = require('fs'); // для работы с файлами 
const sourceMaps = require('gulp-sourcemaps'); //исходные карты SCSS
const plumber = require('gulp-plumber'); //выводит ошибки
const notify = require('gulp-notify'); //выводит ошибки
const webpack = require('webpack-stream'); // для сборки js 
const babel = require('gulp-babel'); // помогает перенастройить код под старый js
const imagemin = require('gulp-imagemin'); //для оптимизаций картинки
const changed = require('gulp-changed'); //для ускорения, не трогает ранее оптимизируемые файлы, только добавленые новые

//---Удаление папки build--------------------------------------------------------------------

gulp.task('clean:dev', function (done) {
	if (fs.existsSync('./docs/')) {
		return gulp
			.src('./docs/', { read: false })
			.pipe(clean({ force: true }));
	}
	done();
});

//------------------------------------------------------------------------------------------

//---Сборка Html из разных частей ----------------------------------------------------------

const fileIncludeSetting = {
	prefix: '@@',
	basepath: '@file',
};

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('html:dev', function () {
	return (
		gulp
			.src(['./src/html/**/*.html', '!./src/html/blocks/*.html']) // взяли файлы кроме папки blocks
			.pipe(changed('./docs/', { hasChanged: changed.compareContents })) //hasChanged также автообновляет вторичные страницы
			.pipe(plumber(plumberNotify('HTML')))
			.pipe(fileInclude(fileIncludeSetting)) // обработали
			.pipe(gulp.dest('./docs/')) //сохранили в dist
	);
});

//------------------------------------------------------------------------------------------

//---Сборка SCSS ---------------------------------------------------------------------------

gulp.task('sass:dev', function () {
	return (
		gulp
			.src('./src/scss/*.scss')
			.pipe(changed('./docs/css/'))
			.pipe(plumber(plumberNotify('SCSS')))
			.pipe(sourceMaps.init()) //инициализируем map
			.pipe(sassGlob()) //автоподключение SCSS
			.pipe(sass()) //превращаем в scss
			.pipe(sourceMaps.write())
			.pipe(gulp.dest('./docs/css/'))
	);
});

//------------------------------------------------------------------------------------------

//---Копирование изображений----------------------------------------------------------------

gulp.task('images:dev', function () {
	return gulp
		.src('./src/img/**/*')
		.pipe(changed('./docs/img/'))
		// .pipe(imagemin({ verbose: true })) //показывает в консоли что оптимизировано и на сколько //в режиме разработки можно отключить
		.pipe(gulp.dest('./docs/img/'));
});

//--------------------------------------------------------------------------------------------

//---Шрифты/Файлы-----------------------------------------------------------------------------

gulp.task('fonts:dev', function () {
	return gulp
		.src('./src/fonts/**/*')
		.pipe(changed('./docs/fonts/'))
		.pipe(gulp.dest('./docs/fonts/'));
});

gulp.task('files:dev', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'));
});

gulp.task('video:dev', function () {
	return gulp
		.src('./src/video/**/*')
		.pipe(changed('./docs/video/'))
		.pipe(gulp.dest('./docs/video/'));
});

//--------------------------------------------------------------------------------------------

//---JS---------------------------------------------------------------------------------------

gulp.task('js:dev', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		// .pipe(babel()) // отключение в режиме разработки, тестирование старых браузеров
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./docs/js/'));
});

//------------------------------------------------------------------------------------------

//---Автообновление-------------------------------------------------------------------------

const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:dev', function () {
	return gulp.src('./docs/').pipe(server(serverOptions));
});

//------------------------------------------------------------------------------------------

//---Слежение за файлами - html,css,image---------------------------------------------------

gulp.task('watch:dev', function () {
	gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
	gulp.watch('./src/html/**/*.html', gulp.parallel('html:dev'));
	gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
	gulp.watch('./src/video/**/*', gulp.parallel('video:dev'));
	gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
	gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
	gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
});

//------------------------------------------------------------------------------------------