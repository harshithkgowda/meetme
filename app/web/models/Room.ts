import type { User } from "./User";

export class Room{
    id: string;
    users: User[] = [];

    constructor(id:string){
        this.id = id
    }

    addUser(user:User){
        if(this.users.length < 2) this.users.push(user)
    }

    removeUser(userId:string){
        if(this.users.length > 0) this.users = this.users.filter((u)=>u.id !== userId)
    }

    isFull():boolean{
        return this.users.length === 2;
    }
}