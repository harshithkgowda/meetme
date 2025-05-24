import { Room } from "web/models/Room";
import { User } from "web/models/User";

export class RoomManager{
    rooms:Map<string, Room>=new Map()

    createRoom():Room{
        const room = new Room(crypto.randomUUID())
        this.rooms.set(room.id, room)
        return room
    }

    getRoom(roomId:string):Room | undefined{
        return this.rooms.get(roomId)
    }

    joinRoom(roomId:string, user:User){
        const room = this.getRoom(roomId)
        if(!room || room.isFull()){
            return false;
        }
        room.addUser(user)
        return true
    }

    leaveRoom(roomId:string, userId:string){
        const room = this.getRoom(roomId)
        if(room){
            room.removeUser(userId);
            if(room.users.length === 0){
                this.rooms.delete(roomId)
            }
        }
    }
}