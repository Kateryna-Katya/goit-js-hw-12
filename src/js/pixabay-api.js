import axios from 'axios';

axios.defaults.baseURL = `https://pixabay.com/api/`;

export const fetchPhotos = (userSerch, page) => {
    const axiosOptions = {
        params: {
            key: "45517792-9e921d102392e39380fbae016",
            q: userSerch,
            image_type: "photo",
            orientation: "horizontal",
            safesearch: "true",
            page: page,
            per_page: 15,
        },
    };
    return axios.get(``, axiosOptions);

};