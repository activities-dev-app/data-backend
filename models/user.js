export class User {

    constructor(user) {
        user.key && (this.key = user.key);
        this.username = user.username;
        this.email = user.email;
        this.name = user.name;
        this.email_verified = user.email_verified || false;
        this.active = user.active || false;
        this.created_at = user.created_at || Date.now();
        this.updated_at = user.updated_at || null;
    }
}