import { v4 as uuidv4 } from "uuid";

export class Discussion {
  id;
  image;
  content;
  authorId;
  createdAt;

  constructor(id, image, content, authorId, createdAt) {
    this.id = id;
    this.image = image;
    this.content = content;
    this.authorId = authorId;
    this.createdAt = createdAt;
  }

  static create(content, authorId, image) {
    return new Discussion(
      uuidv4(),
      image,
      content,
      authorId,
      new Date().toISOString(),
    );
  }

  static fromJSON(data, image) {
    return new Discussion(
      data.id,
      image,
      data.content,
      data.authorId,
      data.createdAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      image: this.image,
      content: this.content,
      authorId: this.authorId,
      createdAt: this.createdAt,
    };
  }
}
