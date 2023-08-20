export interface PlayerState {
    id: string;
    name: string;
    team: number;
    me: boolean;
    leader: boolean;
    character: number;
};

export interface LobbyState {
    id: string;
    private: boolean;
    state: number;
    players: PlayerState[]
};

export interface Config {
    saveLogin: boolean;
    showName: boolean;
    name: string;
    locale: string;
};
