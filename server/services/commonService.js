import * as commonRepository from "../repositories/commonRepository.js";

export async function search(searchParams) {
    return await commonRepository.search(searchParams);
}

export async function feed(params) {
    return await commonRepository.feed(params);
}