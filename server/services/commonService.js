import * as commonRepository from "../repositories/commonRepository.js";

export function search(searchTerm){
    return commonRepository.search(searchTerm);
}