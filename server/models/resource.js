
export class Resource {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.url = data.url;
        this.category = data.category;
        this.createdAt = data.createdAt;
        this.likes = data.likes || 0;
        this.dislikes = data.dislikes || 0;
        this.fileCount = data.fileCount || 0;
        this.downloadCount = data.downloadCount || 0;
    }

    like() {
        this.likes += 1;
    }

    dislike() {
        this.dislikes += 1;
    }
}
