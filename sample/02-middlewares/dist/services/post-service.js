export class PostService {
    async getPost(id) {
        return { id, title: 'Lem is genius!', body: 'Yep, he is!' };
    }
    async getPosts() {
        return [{ id: 1, title: 'Lem is genius!', body: 'Yep, he is!' }];
    }
}
