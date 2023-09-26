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
	if (fs.existsSync('./build/')) {
		return gulp
			.src('./build/', { read: false })
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
			.pipe(changed('./build/', { hasChanged: changed.compareContents })) //hasChanged также автообновляет вторичные страницы
			.pipe(plumber(plumberNotify('HTML')))
			.pipe(fileInclude(fileIncludeSetting)) // обработали
			.pipe(gulp.dest('./build/')) //сохранили в dist
	);
});

//------------------------------------------------------------------------------------------

//---Сборка SCSS ---------------------------------------------------------------------------

gulp.task('sass:dev', function () {
	return (
		gulp
			.src('./src/scss/*.scss')
			.pipe(changed('./build/css/')) 
			.pipe(plumber(plumberNotify('SCSS')))
			.pipe(sourceMaps.init()) //инициализируем map
			.pipe(sassGlob()) //автоподключение SCSS
			.pipe(sass()) //превращаем в scss
			.pipe(sourceMaps.write())
			.pipe(gulp.dest('./build/css/'))
	);
});

//------------------------------------------------------------------------------------------

//---Копирование изображений----------------------------------------------------------------

gulp.task('images:dev', function () {
	return gulp
		.src('./src/img/**/*')
		.pipe(changed('./build/img/'))
		// .pipe(imagemin({ verbose: true })) //показывает в консоли что оптимизировано и на сколько //в режиме разработки можно отключить
		.pipe(gulp.dest('./build/img/'));
});

//--------------------------------------------------------------------------------------------

//---Шрифты/Файлы-----------------------------------------------------------------------------

gulp.task('fonts:dev', function () {
	return gulp
		.src('./src/fonts/**/*')
		.pipe(changed('./build/fonts/'))
		.pipe(gulp.dest('./build/fonts/'));
});

gulp.task('files:dev', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./build/files/'))
		.pipe(gulp.dest('./build/files/'));
});

gulp.task('video:dev', function () {
	return gulp
		.src('./src/video/**/*')
		.pipe(changed('./build/video/'))
		.pipe(gulp.dest('./build/video/'));
});

//--------------------------------------------------------------------------------------------

//---JS---------------------------------------------------------------------------------------

gulp.task('js:dev', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./build/js/'))
		.pipe(plumber(plumberNotify('JS')))
		// .pipe(babel()) // отключение в режиме разработки, тестирование старых браузеров
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./build/js/')); 
});

//------------------------------------------------------------------------------------------

//---Автообновление-------------------------------------------------------------------------

const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:dev', function () {
	return gulp.src('./build/').pipe(server(serverOptions));
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