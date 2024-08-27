import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";



import { createGalleryCardTemplate } from "./js/render-functions.js";
import { fetchPhotos } from "./js/pixabay-api.js"


const searchFormEl = document.querySelector(`.js-search-form`);
const galleryEl = document.querySelector('.js-gallery');
const loadMoreBtnEl = document.querySelector(`.js-load-more`);

const loadingIndicatorEl = document.createElement('div');

loadingIndicatorEl.classList.add('loading-indicator', 'hidden');
document.body.appendChild(loadingIndicatorEl);
let currentPage = 1;
let searchedValue = '';
let cardHeight = 0;

const lightbox = new SimpleLightbox('.js-gallery a', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
    overlayOpacity: 0.7,
});

function showLoadingIndicator() {
    loadingIndicatorEl.classList.remove('hidden');
}
function hideLoadingIndicator() {
    loadingIndicatorEl.classList.add('hidden');
}


const onSearchFormSubmit = async event => {
    try {
        event.preventDefault();

        searchedValue = searchFormEl.elements.user_query.value.trim();
        if (!searchedValue) {
            iziToast.warning({
                message: 'Please enter a search query.',
                position: 'topRight',
            });
            return;
        }
        showLoadingIndicator();
        currentPage = 1;
        const response = await fetchPhotos(searchedValue, currentPage);

        if (response.data.total === 0) {
            iziToast.error({
                message: 'Sorry, there are no images matching your search query. Please try again!',
                position: 'topRight',
            });
            loadMoreBtnEl.classList.add('is-hidden');

            galleryEl.innerHTML = '';
            searchFormEl.reset();
            hideLoadingIndicator();
            return;
        }

        const galleryCardsTemplate = response.data.hits.map(imgDetails => createGalleryCardTemplate(imgDetails)).join('');

        galleryEl.innerHTML = galleryCardsTemplate;
        const galleryCardEl = galleryEl.querySelector('a');

        cardHeight = galleryCardEl.getBoundingClientRect().height;

        loadMoreBtnEl.classList.remove('is-hidden');
        lightbox.refresh();

    } catch (err) {
        console.log(err);
    }
    finally {
        hideLoadingIndicator();
        searchFormEl.reset();
    };
};
const onLoadMoreBtnClick = async event => {
    try {
        currentPage++;
        showLoadingIndicator();

        const response = await fetchPhotos(searchedValue, currentPage);
        const totalHits = response.data.total;
        const currentHits = galleryEl.querySelectorAll('a').length;
        const galleryCardsTemplate = response.data.hits
            .map(imgDetails => createGalleryCardTemplate(imgDetails))
            .join('');

        galleryEl.insertAdjacentHTML('beforeend', galleryCardsTemplate);

        lightbox.refresh();

        if (currentHits + response.data.hits.length >= totalHits) {
            loadMoreBtnEl.classList.add('is-hidden');
            iziToast.error({
                message: 'We are sorry, but you have reached the end of search results.',
                position: 'topRight',
            });
        } 
        window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
        });
    } catch (err) {
        console.log(err);
    }finally {
        hideLoadingIndicator();
    }
};

searchFormEl.addEventListener('submit', onSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', onLoadMoreBtnClick);