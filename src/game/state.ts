
interface Update<T> {
    address: string;
    from: T;
    to: T;
    when: number;
}


export default class State {
    private readOnly: Map<string, any> = new Map<string, any>()
    private readWrite: Map<string, any> = new Map<string, any>()
    private writeStack: Update<unknown>[] = [];

    // server
    
}

// in state
// updates only by server. on change, game logic follows.
// server can send update message to modify

// out state
// game updates state.
//  when game updates, `state before update` and `update detail` is stacked.
//  state sends update to server with sequential tick id
// server updates state.
//  when server sends state update with tick id, 
//  compare stacked state with same tick id 
//      if diff, roll back to `state before update` in that tick
// 
// on screen game completely follows state here. 


/**
 * GlobalState: {
 *  maze: maze json,
 *  gameStatus: lobby / match / over
 *  teams: {
 *      player: [playerid, playerid],
 *      checkpoint: [], // who reached the first checkpoint
 *      items: []
 *  }
 * 
 * [playerid, playerid] // red red blue blue
 * }
 * 
 * 
 * player: {
 *  id: number,
 *  name: string,
 *  position: [x, y],
 *  lastAction: {
 *      action: move:up / use:item / check:1,
 *      invokeTime: time
 *  }
 * }
 * 
 * other player: {
 *  id: number,
 *  name: string,
 *  position: [x, y],
 *  toward: up / right ~
 * }
 * 
 * controlState: [{
 *  keysDown: up,
 *  downSince: time
 * }]
 * 
 */



/**
 * message
 * time
 * tick
 * update
 * -update_key1 value
 * -update_key2 value
 * get
 * -get_key1
 * -get_key2
 * 
 * 
 * 
 * 
 */



/**
 * 
 * time sync process
 * join >
 * 
 * pingpong:
 * ping <
 * pong >
 * 
 * clock offset sync
 */