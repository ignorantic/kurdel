export class PostService {
  public async getPost(id: number) {
    return { id, title: 'Lem is genius!', body: 'Yep, he is!'};
  }

  public async getPosts() {
    return [{ id: 1, title: 'Lem is genius!', body: 'Yep, he is!'}];
  }
}
