export class Session {

    constructor({ token, user }) {
        this.token = token;
        this.userId = user.key;
        this.email = user.email;
        this.name = user.name || "";
        this.username = user.username || "";
        this.active = user.active;
        this.email_verified = user.email_verified;
    }
}