export type PlayerState = {
    id: string;
    name: string;
    team: number;
    me: boolean;
    ready: boolean;
    leader: boolean;
    character: number;
};

export type LobbyState = {
    state: number;
    players: PlayerState[]
};
