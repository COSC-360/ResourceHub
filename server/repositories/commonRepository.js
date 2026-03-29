import DiscussionRepository from "./discussionRepository.js"

export async function search(searchTerm){
    const discussions = await DiscussionRepository.search(searchTerm);
    //const courses = DiscussionRepository.search(searchTerm);

    const results = { discussions: discussions };

    return results;
}