export class Hash {

    constructor({ hash, userId }) {
        this.created_at = Date.now();
        this.updated_at = null;
        this.userId = userId;
        this.hash = hash
    }
}
