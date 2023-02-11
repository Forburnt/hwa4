import { Message } from "./chat.mjs";
import { Member } from "./members.mjs";
import { PlayerStatus } from "./player.mjs";


export {
    UserUpdate,
}



class UserUpdate {
    /**
     * @param {boolean} is_connected
     * @param {Date} updated_at
     * @param {Message[]} new_msgs
     * @param {PlayerStatus?} player_status
     */
    constructor(is_connected, updated_at, new_msgs, player_status) {
        this.is_connected = is_connected;
        this.updated_at = updated_at;
        this.new_msgs = new_msgs;
        this.player_status = player_status;
    }
    

    raw() {
        return {
            is_connected: this.is_connected,
            updated_at: this.updated_at,
            new_msgs: this.new_msgs.map(msg => msg.raw()),
            player_status: this.player_status?.raw(),
        }
    }


    /**
     * @param {Member} member
     */
    static update_user(member) {
        let is_connected = member.is_connected_adv();
        let last_updated_at = member.last_updated_at();

        if (!is_connected) {
            return new UserUpdate(is_connected, last_updated_at, [], null);
        }

        // member.room cannot be null
        let new_msgs = member.room?.chat.queue_msgs(member);
        let player_status = member.room?.player.status();

        if (!new_msgs || !player_status) {
            throw new Error("user_updated.mjs : update_user behaves weird");
        }

        member.update();
        let updated_at = member.last_updated_at();
        
        return new UserUpdate(
            is_connected, updated_at, new_msgs, player_status);
    }
}

