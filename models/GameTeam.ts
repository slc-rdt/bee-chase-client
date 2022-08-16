import { BaseModel } from './BaseModel';
import { Game } from './Game';
import { GameTeamUser } from './GameTeamUser';
import { SessionUser } from './SessionUser';

export interface GameTeam extends BaseModel {
  game_id: string;
  game: Game;
  has_access_code: boolean;
  id: string;
  name: string;
  color: string | null;
  members: GameTeamUser[];
}
