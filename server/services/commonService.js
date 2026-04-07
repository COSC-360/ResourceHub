import * as commonRepository from "../repositories/commonRepository.js";

export async function search(searchTerm) {
    return await commonRepository.search(searchTerm);
}

export async function feed(params) {
    return await commonRepository.feed(params);
}