//Режим продакшэн

const gulp = require('gulp');

// HTML
const fileInclude = require('gulp-file-include'); //Сборка Html
const htmlclean = require('gulp-htmlclean'); //Сжатие HTML 
const webpHTML = require('gulp-webp-html'); //webp генерация

// SASS
const sass = require('gulp-sass')(require('sass')); //Сборка SCSS
const sassGlob = require('gulp-sass-glob'); //автоподключение SCSS
const autoprefixer = require('gulp-autoprefixer'); //автопрефиксы
const csso = require('gulp-csso'); //минификация css
const webpCss = require('gulp-webp-css'); //webp генерация в css

const server = require('gulp-server-livereload'); //Запуск сервера автообновления
const clean = require('gulp-clean'); // Удаление папки dist
const fs = require('fs'); // для работы с файлами 
const sourceMaps = require('gulp-sourcemaps'); //исходные карты SCSS
const groupMedia = require('gulp-group-css-media-queries');  //группировка медиа запросов
const plumber = require('gulp-plumber'); //выводит ошибки
const notify = require('gulp-notify'); //выводит ошибки
const webpack = require('webpack-stream'); // для сборки js
const babel = require('gulp-babel'); // помогает перенастройить код под старый js
const changed = require('gulp-changed'); //для ускорения, не трогает ранее оптимизируемые файлы, только добавленые новые

// Images
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp'); //webp генерация

//---Удаление папки docs--------------------------------------------------------------------

gulp.task('clean:docs', function (done) {
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

gulp.task('html:docs', function () {
	return gulp
		.src(['./src/html/**/*.html', '!./src/html/blocks/*.html']) // взяли файлы кроме папки blocks
		.pipe(changed('./docs/'))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSetting))
		//.pipe(webpHTML()) //автоматическое добавление тега picture которого изначально небыло //пока не работает
		.pipe(htmlclean()) //Сжатие HTML 
		.pipe(gulp.dest('./docs/'));
});

//------------------------------------------------------------------------------------------

//---Сборка SCSS ---------------------------------------------------------------------------

gulp.task('sass:docs', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./docs/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init()) //инициализируем map
		.pipe(autoprefixer()) //запуск автопрефикса
		.pipe(sassGlob())
		.pipe(webpCss()) //webp генерация в css
		.pipe(groupMedia()) //включать во время продакшэна, иначе ломает (scss map)
		.pipe(sass()) //превращаем в scss
		.pipe(csso()) //минификация css
		.pipe(sourceMaps.write()) // после мы их пишем
		.pipe(gulp.dest('./docs/css/'));
});

//------------------------------------------------------------------------------------------

//---Копирование изображений----------------------------------------------------------------

gulp.task('images:docs', function () {
	return gulp
		.src('./src/img/**/*')
		.pipe(changed('./docs/img/'))
		.pipe(webp()) //генерация webp
		.pipe(gulp.dest('./docs/img/'))
		.pipe(gulp.src('./src/img/**/*'))
		.pipe(changed('./docs/img/'))
		.pipe(imagemin({ verbose: true })) //показывает в консоли что оптимизировано и на сколько
		.pipe(gulp.dest('./docs/img/'));
});

//------------------------------------------------------------------------------------------

//---Шрифты/Файлы----------------------------------------------------------------------------

gulp.task('fonts:docs', function () {
	return gulp
		.src('./src/fonts/**/*')
		.pipe(changed('./docs/fonts/'))
		.pipe(gulp.dest('./docs/fonts/'));
});

gulp.task('files:docs', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'));
});

//-----------------------------------------------------------------------------------------

//---JS------------------------------------------------------------------------------------

gulp.task('js:docs', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(babel())
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./docs/js/'));
});

//------------------------------------------------------------------------------------------

//---Автообновление-------------------------------------------------------------------------

const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:docs', function () {
	return gulp.src('./docs/').pipe(server(serverOptions));
});

//------------------------------------------------------------------------------------------

