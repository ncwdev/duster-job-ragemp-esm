export class Person {
    id = null;
    profile = null;

    job = null;

    constructor(id, profile) {
        this.id = id;
        this.profile = profile;
    }

    getId() {
        return this.id;
    }

    getJob() {
        return this.job;
    }

    setJob(job) {
        this.job = job;
    }

    getDusterJobPoints() {
        return this.profile.getDusterJobPoints();
    }

    setDusterJobPoints(value) {
        this.profile.setDusterJobPoints(value);
    }

    getExpa() {
        return this.profile.getExpa();
    }

    setExpa(value) {
        this.profile.setExpa(value);
    }

    clear() {
        this.id = null;
        this.profile = null;
        this.job = null;
    }
};
